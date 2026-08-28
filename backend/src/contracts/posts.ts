import { z } from "zod";

export const postMediaInputSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.url(),
  altText: z.string().trim().max(300).optional(),
});

export const createPostSchema = z.object({
  caption: z.string().trim().min(1).max(5_000),
  location: z.string().trim().max(200).optional(),
  priceLabel: z.string().trim().max(80).optional(),
  dateLabel: z.string().trim().max(120).optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  eventId: z.string().trim().min(1).optional(),
  media: z.array(postMediaInputSchema).min(1).max(10),
});

export const postListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const reportPostSchema = z.object({
  reason: z.enum(["spam", "misleading", "abuse", "other"]),
  details: z.string().trim().max(1_000).optional(),
});

export const moderatePostSchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("dismiss"),
    note: z.string().trim().max(2_000).optional(),
  }),
  z.object({
    decision: z.literal("hide"),
    note: z.string().trim().min(10).max(2_000),
  }),
]);

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type PostListQuery = z.infer<typeof postListQuerySchema>;
export type ReportPostInput = z.infer<typeof reportPostSchema>;
export type ModeratePostInput = z.infer<typeof moderatePostSchema>;
