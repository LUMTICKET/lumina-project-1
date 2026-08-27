import { EventStatus, Prisma } from "@prisma/client";
import type { VenueListQuery } from "@/contracts/venues";
import { prisma } from "@/lib/prisma";

const venueSelect = {
  id: true,
  name: true,
  address: true,
  city: true,
  latitude: true,
  longitude: true,
  _count: {
    select: { events: { where: { status: EventStatus.PUBLISHED } } },
  },
} satisfies Prisma.VenueSelect;

function mapVenue(venue: Prisma.VenueGetPayload<{ select: typeof venueSelect }>) {
  return {
    id: venue.id,
    name: venue.name,
    address: venue.address,
    city: venue.city,
    latitude: venue.latitude?.toNumber() ?? null,
    longitude: venue.longitude?.toNumber() ?? null,
    eventCount: venue._count.events,
  };
}

export async function listVenues(input: VenueListQuery) {
  const venues = await prisma.venue.findMany({
    where: {
      ...(input.city ? { city: { contains: input.city, mode: "insensitive" } } : {}),
      ...(input.q
        ? {
            OR: [
              { name: { contains: input.q, mode: "insensitive" } },
              { address: { contains: input.q, mode: "insensitive" } },
              { city: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: venueSelect,
    orderBy: [{ city: "asc" }, { name: "asc" }, { id: "asc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const hasMore = venues.length > input.limit;
  const page = hasMore ? venues.slice(0, input.limit) : venues;

  return {
    items: page.map(mapVenue),
    nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
  };
}

export async function getVenueById(venueId: string) {
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: venueSelect,
  });

  return venue ? mapVenue(venue) : null;
}
