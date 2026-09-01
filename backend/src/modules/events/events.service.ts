import { EventStatus, Prisma } from "@prisma/client";
import type {
  CreateEventInput,
  EventListQuery,
  ModerateEventInput,
  UpdateEventInput,
} from "@/contracts/events";
import { prisma } from "@/lib/prisma";

const eventInclude = {
  organizer: true,
  venue: true,
  ticketTiers: { orderBy: { priceMinor: "asc" as const } },
} satisfies Prisma.EventInclude;

type EventWithRelations = Prisma.EventGetPayload<{
  include: typeof eventInclude;
}>;

function mapEvent(event: EventWithRelations) {
  return {
    id: event.id,
    title: event.title,
    subtitle: event.subtitle,
    imageUrl: event.imageUrl,
    organizer: {
      id: event.organizer.id,
      name: event.organizer.name,
      avatarUrl: event.organizer.avatarUrl,
    },
    venue: {
      id: event.venue.id,
      name: event.venue.name,
      address: event.venue.address,
      city: event.venue.city,
      latitude: event.venue.latitude?.toNumber() ?? null,
      longitude: event.venue.longitude?.toNumber() ?? null,
    },
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt?.toISOString() ?? null,
    description: event.description,
    tags: event.tags,
    status: event.status.toLowerCase(),
    maxPerUser: event.maxPerUser,
    ticketTiers: event.ticketTiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      priceMinor: tier.priceMinor,
      currency: tier.currency.trim(),
      capacity: tier.capacity,
      available: tier.available,
      perks: tier.perks,
    })),
  };
}

function mapManagedEvent(event: EventWithRelations) {
  return {
    ...mapEvent(event),
    moderationNote: event.moderationNote,
    reviewedAt: event.reviewedAt?.toISOString() ?? null,
  };
}

export async function listEvents(input: EventListQuery) {
  const where: Prisma.EventWhereInput = {
    status: EventStatus.PUBLISHED,
    ...(input.city
      ? { venue: { city: { contains: input.city, mode: "insensitive" } } }
      : {}),
    ...(input.q
      ? {
          OR: [
            { title: { contains: input.q, mode: "insensitive" } },
            { subtitle: { contains: input.q, mode: "insensitive" } },
            { description: { contains: input.q, mode: "insensitive" } },
            { organizer: { name: { contains: input.q, mode: "insensitive" } } },
            { venue: { name: { contains: input.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const events = await prisma.event.findMany({
    where,
    include: eventInclude,
    orderBy: [{ startsAt: "asc" }, { id: "asc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const hasMore = events.length > input.limit;
  const page = hasMore ? events.slice(0, input.limit) : events;

  return {
    items: page.map(mapEvent),
    nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
  };
}

export async function getEventById(eventId: string) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, status: EventStatus.PUBLISHED },
    include: eventInclude,
  });

  return event ? mapEvent(event) : null;
}

export async function createEventDraft(
  input: CreateEventInput,
  organizerId: string,
) {
  const venue = await prisma.venue.findUnique({
    where: { id: input.venueId },
    select: { id: true },
  });
  if (!venue) return null;

  const event = await prisma.event.create({
    data: {
      title: input.title,
      subtitle: input.subtitle,
      organizerId,
      venueId: input.venueId,
      startsAt: new Date(input.startsAt),
      endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
      description: input.description,
      imageUrl: input.imageUrl,
      tags: input.tags,
      maxPerUser: input.maxPerUser,
      status: EventStatus.DRAFT,
      ticketTiers: {
        create: input.ticketTiers.map((tier) => ({
          name: tier.name,
          priceMinor: tier.priceMinor,
          currency: tier.currency,
          capacity: tier.capacity,
          available: tier.available ?? tier.capacity,
          perks: tier.perks,
        })),
      },
    },
    include: eventInclude,
  });

  return mapEvent(event);
}

export async function listOrganizerEvents(organizerId: string) {
  const events = await prisma.event.findMany({
    where: { organizerId },
    include: eventInclude,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });

  return events.map(mapManagedEvent);
}

export async function submitEventForReview(eventId: string, organizerId: string) {
  const ownedEvent = await prisma.event.findFirst({
    where: { id: eventId, organizerId },
    select: { status: true },
  });
  if (!ownedEvent) return { kind: "not_found" as const };
  if (
    ownedEvent.status !== EventStatus.DRAFT &&
    ownedEvent.status !== EventStatus.REJECTED
  ) {
    return { kind: "not_editable" as const };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { status: EventStatus.PENDING_REVIEW },
  });

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: eventInclude,
  });
  return event
    ? { kind: "updated" as const, event: mapManagedEvent(event) }
    : { kind: "not_found" as const };
}

export async function updateEventDraft(
  eventId: string,
  organizerId: string,
  input: UpdateEventInput,
) {
  const existing = await prisma.event.findFirst({
    where: { id: eventId, organizerId },
    select: { status: true, startsAt: true, endsAt: true },
  });
  if (!existing) return { kind: "not_found" as const };
  if (
    existing.status !== EventStatus.DRAFT &&
    existing.status !== EventStatus.REJECTED
  ) {
    return { kind: "not_editable" as const };
  }

  if (input.venueId) {
    const venue = await prisma.venue.findUnique({
      where: { id: input.venueId },
      select: { id: true },
    });
    if (!venue) return { kind: "venue_not_found" as const };
  }

  const startsAt = input.startsAt ? new Date(input.startsAt) : existing.startsAt;
  const endsAt =
    input.endsAt === null
      ? null
      : input.endsAt
        ? new Date(input.endsAt)
        : existing.endsAt;
  if (endsAt && endsAt <= startsAt) {
    return { kind: "invalid_schedule" as const };
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
      ...(input.venueId !== undefined ? { venueId: input.venueId } : {}),
      ...(input.startsAt !== undefined ? { startsAt } : {}),
      ...(input.endsAt !== undefined ? { endsAt } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.maxPerUser !== undefined
        ? { maxPerUser: input.maxPerUser }
        : {}),
      ...(input.ticketTiers
        ? {
            ticketTiers: {
              deleteMany: {},
              create: input.ticketTiers.map((tier) => ({
                name: tier.name,
                priceMinor: tier.priceMinor,
                currency: tier.currency,
                capacity: tier.capacity,
                available: tier.available ?? tier.capacity,
                perks: tier.perks,
              })),
            },
          }
        : {}),
      status: EventStatus.DRAFT,
    },
    include: eventInclude,
  });

  return { kind: "updated" as const, event: mapManagedEvent(event) };
}

export async function listPendingModerationEvents() {
  const events = await prisma.event.findMany({
    where: { status: EventStatus.PENDING_REVIEW },
    include: eventInclude,
    orderBy: [{ updatedAt: "asc" }, { id: "asc" }],
  });

  return events.map(mapManagedEvent);
}

export async function moderateEvent(
  eventId: string,
  moderatorId: string,
  input: ModerateEventInput,
) {
  const existing = await prisma.event.findUnique({
    where: { id: eventId },
    select: { status: true },
  });
  if (!existing) return { kind: "not_found" as const };
  if (existing.status !== EventStatus.PENDING_REVIEW) {
    return { kind: "not_pending" as const };
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      status:
        input.decision === "approve"
          ? EventStatus.PUBLISHED
          : EventStatus.REJECTED,
      moderationNote: input.note ?? null,
      reviewedAt: new Date(),
      reviewedById: moderatorId,
    },
    include: eventInclude,
  });

  return { kind: "updated" as const, event: mapManagedEvent(event) };
}
