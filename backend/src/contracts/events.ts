import { z } from "zod";

export const eventStatuses = [
  "draft",
  "pending_review",
  "published",
  "cancelled",
] as const;

export const eventStatusSchema = z.enum(eventStatuses);

export const ticketTierInputSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    priceMinor: z.number().int().nonnegative(),
    currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
    capacity: z.number().int().positive(),
    available: z.number().int().nonnegative().optional(),
    perks: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  })
  .refine(
    ({ available, capacity }) => available === undefined || available <= capacity,
    {
      message: "Available inventory cannot exceed capacity",
      path: ["available"],
    },
  );

export const createEventSchema = z
  .object({
    title: z.string().trim().min(3).max(160),
    subtitle: z.string().trim().max(240).optional(),
    organizerId: z.string().trim().min(1),
    venueId: z.string().trim().min(1),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }).optional(),
    description: z.string().trim().min(10).max(10_000),
    imageUrl: z.url().optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
    maxPerUser: z.number().int().positive().max(100).default(5),
    ticketTiers: z.array(ticketTierInputSchema).min(1).max(50),
  })
  .refine(
    ({ startsAt, endsAt }) =>
      endsAt === undefined || new Date(endsAt) > new Date(startsAt),
    {
      message: "Event end time must be after its start time",
      path: ["endsAt"],
    },
  );

export const eventListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  status: eventStatusSchema.default("published"),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type EventStatus = z.infer<typeof eventStatusSchema>;
export type TicketTierInput = z.infer<typeof ticketTierInputSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type EventListQuery = z.infer<typeof eventListQuerySchema>;
