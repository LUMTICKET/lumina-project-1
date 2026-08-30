import { z } from "zod";

export const courierServiceLevelSchema = z.enum(["same_day", "next_day", "standard"]);

export const courierListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  serviceArea: z.string().trim().max(120).optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const courierListingFieldsSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(5_000),
  logoUrl: z.url().optional(),
  serviceAreas: z.array(z.string().trim().min(2).max(120)).min(1).max(50),
  serviceLevels: z.array(courierServiceLevelSchema).min(1).max(3),
  basePriceMinor: z.number().int().nonnegative(),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  estimatedMinHours: z.number().int().positive().max(720),
  estimatedMaxHours: z.number().int().positive().max(720),
  contactEmail: z.email().optional(),
  contactPhone: z.string().trim().min(7).max(40).optional(),
});

export const createCourierListingSchema = courierListingFieldsSchema.refine(
  ({ estimatedMinHours, estimatedMaxHours }) =>
    estimatedMaxHours >= estimatedMinHours,
  {
  message: "Maximum delivery time cannot be shorter than minimum delivery time",
  path: ["estimatedMaxHours"],
  },
);

export const updateCourierListingSchema = courierListingFieldsSchema.partial().extend({
  status: z.enum(["active", "inactive"]).optional(),
}).strict().refine((input) => Object.keys(input).length > 0, {
  message: "At least one courier listing field must be provided",
});

export const createParcelSchema = z.object({
  origin: z.string().trim().min(2).max(240),
  destination: z.string().trim().min(2).max(240),
  recipientName: z.string().trim().min(2).max(160),
  recipientContact: z.string().trim().min(5).max(160),
  contentsDescription: z.string().trim().max(1_000).optional(),
  estimatedDelivery: z.iso.datetime({ offset: true }).optional(),
});

export const createTrackingEventSchema = z.object({
  status: z.enum(["received", "in_transit", "out_for_delivery", "delivered", "exception", "cancelled"]),
  location: z.string().trim().max(240).optional(),
  message: z.string().trim().min(2).max(500),
  occurredAt: z.iso.datetime({ offset: true }).optional(),
});

export type CourierListQuery = z.infer<typeof courierListQuerySchema>;
export type CreateCourierListingInput = z.infer<typeof createCourierListingSchema>;
export type UpdateCourierListingInput = z.infer<typeof updateCourierListingSchema>;
export type CreateParcelInput = z.infer<typeof createParcelSchema>;
export type CreateTrackingEventInput = z.infer<typeof createTrackingEventSchema>;
