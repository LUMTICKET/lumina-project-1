import { randomBytes } from "node:crypto";
import {
  CourierListingStatus,
  CourierServiceLevel,
  ParcelStatus,
  Prisma,
} from "@prisma/client";
import type {
  CourierListQuery,
  CreateCourierListingInput,
  CreateParcelInput,
  CreateTrackingEventInput,
  UpdateCourierListingInput,
} from "@/contracts/couriers";
import { prisma } from "@/lib/prisma";

const listingInclude = {
  organizer: { select: { id: true, name: true, avatarUrl: true } },
} satisfies Prisma.CourierListingInclude;

const parcelInclude = {
  courierListing: { include: listingInclude },
  trackingEvents: { orderBy: [{ occurredAt: "asc" as const }, { id: "asc" as const }] },
} satisfies Prisma.ParcelInclude;

const serviceLevelMap = {
  same_day: CourierServiceLevel.SAME_DAY,
  next_day: CourierServiceLevel.NEXT_DAY,
  standard: CourierServiceLevel.STANDARD,
} as const;

const parcelStatusMap = {
  received: ParcelStatus.RECEIVED,
  in_transit: ParcelStatus.IN_TRANSIT,
  out_for_delivery: ParcelStatus.OUT_FOR_DELIVERY,
  delivered: ParcelStatus.DELIVERED,
  exception: ParcelStatus.EXCEPTION,
  cancelled: ParcelStatus.CANCELLED,
} as const;

type ListingWithOrganizer = Prisma.CourierListingGetPayload<{
  include: typeof listingInclude;
}>;
type ParcelWithTracking = Prisma.ParcelGetPayload<{ include: typeof parcelInclude }>;

function mapListing(listing: ListingWithOrganizer) {
  return {
    id: listing.id,
    name: listing.name,
    description: listing.description,
    logoUrl: listing.logoUrl,
    organizer: listing.organizer,
    serviceAreas: listing.serviceAreas,
    serviceLevels: listing.serviceLevels.map((level) => level.toLowerCase()),
    basePriceMinor: listing.basePriceMinor,
    currency: listing.currency.trim(),
    estimatedMinHours: listing.estimatedMinHours,
    estimatedMaxHours: listing.estimatedMaxHours,
    status: listing.status.toLowerCase(),
  };
}

function mapTracking(parcel: ParcelWithTracking) {
  return {
    id: parcel.id,
    trackingCode: parcel.trackingCode,
    courier: mapListing(parcel.courierListing),
    origin: parcel.origin,
    destination: parcel.destination,
    status: parcel.status.toLowerCase(),
    estimatedDelivery: parcel.estimatedDelivery?.toISOString() ?? null,
    createdAt: parcel.createdAt.toISOString(),
    events: parcel.trackingEvents.map((event) => ({
      id: event.id,
      status: event.status.toLowerCase(),
      location: event.location,
      message: event.message,
      occurredAt: event.occurredAt.toISOString(),
    })),
  };
}

export async function listCourierListings(input: CourierListQuery) {
  const listings = await prisma.courierListing.findMany({
    where: {
      status: CourierListingStatus.ACTIVE,
      ...(input.serviceArea ? { serviceAreas: { has: input.serviceArea } } : {}),
      ...(input.q
        ? {
            OR: [
              { name: { contains: input.q, mode: "insensitive" } },
              { description: { contains: input.q, mode: "insensitive" } },
              { organizer: { name: { contains: input.q, mode: "insensitive" } } },
              { serviceAreas: { has: input.q } },
            ],
          }
        : {}),
    },
    include: listingInclude,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const hasMore = listings.length > input.limit;
  const page = hasMore ? listings.slice(0, input.limit) : listings;
  return {
    items: page.map(mapListing),
    nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
  };
}

export async function getCourierListing(listingId: string) {
  const listing = await prisma.courierListing.findFirst({
    where: { id: listingId, status: CourierListingStatus.ACTIVE },
    include: listingInclude,
  });
  return listing ? mapListing(listing) : null;
}

export async function listOrganizerCourierListings(organizerId: string) {
  const listings = await prisma.courierListing.findMany({
    where: { organizerId },
    include: listingInclude,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });
  return listings.map(mapListing);
}

export async function createCourierListing(
  organizerId: string,
  input: CreateCourierListingInput,
) {
  const listing = await prisma.courierListing.create({
    data: {
      ...input,
      organizerId,
      serviceLevels: input.serviceLevels.map((level) => serviceLevelMap[level]),
    },
    include: listingInclude,
  });
  return mapListing(listing);
}

export async function updateCourierListing(
  listingId: string,
  organizerId: string,
  input: UpdateCourierListingInput,
) {
  const owned = await prisma.courierListing.findFirst({
    where: { id: listingId, organizerId },
    select: { estimatedMinHours: true, estimatedMaxHours: true },
  });
  if (!owned) return { kind: "not_found" as const };
  const min = input.estimatedMinHours ?? owned.estimatedMinHours;
  const max = input.estimatedMaxHours ?? owned.estimatedMaxHours;
  if (max < min) return { kind: "invalid_estimate" as const };

  const { status, serviceLevels, ...fields } = input;
  const listing = await prisma.courierListing.update({
    where: { id: listingId },
    data: {
      ...fields,
      ...(serviceLevels
        ? { serviceLevels: serviceLevels.map((level) => serviceLevelMap[level]) }
        : {}),
      ...(status ? { status: status.toUpperCase() as CourierListingStatus } : {}),
    },
    include: listingInclude,
  });
  return { kind: "updated" as const, listing: mapListing(listing) };
}

function createTrackingCode() {
  return `LMN-${randomBytes(8).toString("hex").toUpperCase()}`;
}

export async function createParcel(
  listingId: string,
  organizerId: string,
  userId: string,
  input: CreateParcelInput,
) {
  const listing = await prisma.courierListing.findFirst({
    where: { id: listingId, organizerId },
    select: { id: true },
  });
  if (!listing) return null;

  const parcel = await prisma.parcel.create({
    data: {
      ...input,
      trackingCode: createTrackingCode(),
      courierListingId: listingId,
      createdById: userId,
      estimatedDelivery: input.estimatedDelivery
        ? new Date(input.estimatedDelivery)
        : undefined,
      trackingEvents: {
        create: {
          status: ParcelStatus.CREATED,
          message: "Shipment created",
          location: input.origin,
          createdById: userId,
        },
      },
    },
    include: parcelInclude,
  });
  return mapTracking(parcel);
}

export async function listParcels(listingId: string, organizerId: string) {
  const owned = await prisma.courierListing.findFirst({
    where: { id: listingId, organizerId },
    select: { id: true },
  });
  if (!owned) return null;
  const parcels = await prisma.parcel.findMany({
    where: { courierListingId: listingId },
    include: parcelInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
  });
  return parcels.map(mapTracking);
}

export async function trackParcel(code: string) {
  const parcel = await prisma.parcel.findUnique({
    where: { trackingCode: code.trim().toUpperCase() },
    include: parcelInclude,
  });
  return parcel ? mapTracking(parcel) : null;
}

const allowedTransitions: Record<ParcelStatus, ParcelStatus[]> = {
  CREATED: [ParcelStatus.RECEIVED, ParcelStatus.CANCELLED],
  RECEIVED: [ParcelStatus.IN_TRANSIT, ParcelStatus.CANCELLED],
  IN_TRANSIT: [ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.EXCEPTION],
  OUT_FOR_DELIVERY: [ParcelStatus.DELIVERED, ParcelStatus.EXCEPTION],
  EXCEPTION: [ParcelStatus.IN_TRANSIT, ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.CANCELLED],
  DELIVERED: [],
  CANCELLED: [],
};

export async function addTrackingEvent(
  parcelId: string,
  organizerId: string,
  userId: string,
  input: CreateTrackingEventInput,
) {
  const parcel = await prisma.parcel.findFirst({
    where: { id: parcelId, courierListing: { organizerId } },
    select: { status: true },
  });
  if (!parcel) return { kind: "not_found" as const };
  const nextStatus = parcelStatusMap[input.status];
  if (!allowedTransitions[parcel.status].includes(nextStatus)) {
    return { kind: "invalid_transition" as const };
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.parcelTrackingEvent.create({
      data: {
        parcelId,
        status: nextStatus,
        location: input.location,
        message: input.message,
        occurredAt: input.occurredAt ? new Date(input.occurredAt) : undefined,
        createdById: userId,
      },
    });
    return tx.parcel.update({
      where: { id: parcelId },
      data: { status: nextStatus },
      include: parcelInclude,
    });
  });
  return { kind: "updated" as const, parcel: mapTracking(updated) };
}
