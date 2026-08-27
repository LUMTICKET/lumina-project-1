import { EventStatus, Prisma } from "@prisma/client";
import type { EventListQuery } from "@/contracts/events";
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

export async function listEvents(input: EventListQuery) {
  const where: Prisma.EventWhereInput = {
    status: input.status.toUpperCase() as EventStatus,
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
