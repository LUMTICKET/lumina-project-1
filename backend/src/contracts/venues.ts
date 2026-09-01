import { z } from "zod";

export const venueListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type VenueListQuery = z.infer<typeof venueListQuerySchema>;
