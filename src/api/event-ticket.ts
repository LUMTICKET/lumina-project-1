import type { TicketConfig } from "../components/TicketConfigPage";
import type { ApiEvent } from "./events";

const EVENT_IMAGES: Record<string, TicketConfig["image"]> = {
  "evt-1": require("@/assets/images/event3.jpg"),
  "evt-2": require("@/assets/images/event2.jpg"),
};
export const DEFAULT_EVENT_IMAGE = require("@/assets/images/event2.jpg");

function minorToMajor(amount: number, currency: string) {
  try {
    const fractionDigits =
      new Intl.NumberFormat("en", {
        style: "currency",
        currency,
      }).resolvedOptions().maximumFractionDigits ?? 2;

    return amount / 10 ** fractionDigits;
  } catch {
    return amount / 100;
  }
}

export function toEventTicketConfig(event: ApiEvent): TicketConfig {
  const startsAt = new Date(event.startsAt);

  return {
    id: event.id,
    title: event.title,
    subtitle: event.subtitle ?? undefined,
    category: "event",
    image: event.imageUrl
      ? { uri: event.imageUrl }
      : EVENT_IMAGES[event.id] ?? DEFAULT_EVENT_IMAGE,
    organizer: event.organizer.name,
    organizerAvatar: event.organizer.avatarUrl ?? undefined,
    date: event.startsAt,
    time: startsAt.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
    location: `${event.venue.name}, ${event.venue.city}`,
    tiers: event.ticketTiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      price: minorToMajor(tier.priceMinor, tier.currency),
      currency: tier.currency,
      perks: tier.perks,
      remaining: tier.available,
    })),
    description: event.description,
    tags: event.tags,
    maxPerUser: event.maxPerUser,
  };
}
