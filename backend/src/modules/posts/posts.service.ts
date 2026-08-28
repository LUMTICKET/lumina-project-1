import {
  EventStatus,
  PostMediaType,
  PostReportReason,
  PostReportStatus,
  PostStatus,
  Prisma,
  ReactionType,
} from "@prisma/client";
import type {
  CreatePostInput,
  ModeratePostInput,
  PostListQuery,
  ReportPostInput,
} from "@/contracts/posts";
import { prisma } from "@/lib/prisma";

const anonymousViewerId = "__anonymous__";

function postInclude(viewerId?: string) {
  return {
    author: {
      select: {
        id: true,
        name: true,
        organizer: { select: { name: true, avatarUrl: true } },
      },
    },
    event: { select: { id: true, title: true } },
    media: { orderBy: { sortOrder: "asc" as const } },
    reactions: {
      where: {
        userId: viewerId ?? anonymousViewerId,
        type: ReactionType.LIKE,
      },
      select: { id: true },
    },
    _count: {
      select: {
        reactions: { where: { type: ReactionType.LIKE } },
      },
    },
  } satisfies Prisma.PostInclude;
}

type PostWithRelations = Prisma.PostGetPayload<{
  include: ReturnType<typeof postInclude>;
}>;

function mapPost(post: PostWithRelations) {
  return {
    id: post.id,
    author: {
      id: post.author.id,
      name: post.author.organizer?.name ?? post.author.name,
      avatarUrl: post.author.organizer?.avatarUrl ?? null,
    },
    caption: post.caption,
    location: post.location,
    priceLabel: post.priceLabel,
    dateLabel: post.dateLabel,
    tags: post.tags,
    status: post.status.toLowerCase(),
    media: post.media.map((media) => ({
      id: media.id,
      type: media.type.toLowerCase(),
      url: media.url,
      altText: media.altText,
    })),
    event: post.event,
    reactionCount: post._count.reactions,
    viewerHasReacted: post.reactions.length > 0,
    publishedAt: post.publishedAt.toISOString(),
  };
}

export async function listPosts(input: PostListQuery, viewerId?: string) {
  const posts = await prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      ...(input.q
        ? {
            OR: [
              { caption: { contains: input.q, mode: "insensitive" } },
              { location: { contains: input.q, mode: "insensitive" } },
              { author: { name: { contains: input.q, mode: "insensitive" } } },
              {
                author: {
                  organizer: {
                    is: { name: { contains: input.q, mode: "insensitive" } },
                  },
                },
              },
              { tags: { has: input.q } },
            ],
          }
        : {}),
    },
    include: postInclude(viewerId),
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const hasMore = posts.length > input.limit;
  const page = hasMore ? posts.slice(0, input.limit) : posts;

  return {
    items: page.map(mapPost),
    nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
  };
}

export async function getPost(postId: string, viewerId?: string) {
  const post = await prisma.post.findFirst({
    where: { id: postId, status: PostStatus.PUBLISHED },
    include: postInclude(viewerId),
  });
  return post ? mapPost(post) : null;
}

export async function createPost(input: CreatePostInput, authorId: string) {
  if (input.eventId) {
    const event = await prisma.event.findFirst({
      where: { id: input.eventId, status: EventStatus.PUBLISHED },
      select: { id: true },
    });
    if (!event) return { kind: "event_not_found" as const };
  }

  const post = await prisma.post.create({
    data: {
      authorId,
      eventId: input.eventId,
      caption: input.caption,
      location: input.location,
      priceLabel: input.priceLabel,
      dateLabel: input.dateLabel,
      tags: input.tags,
      media: {
        create: input.media.map((media, index) => ({
          type:
            media.type === "video" ? PostMediaType.VIDEO : PostMediaType.IMAGE,
          url: media.url,
          altText: media.altText,
          sortOrder: index,
        })),
      },
    },
    include: postInclude(authorId),
  });

  return { kind: "created" as const, post: mapPost(post) };
}

export async function addPostLike(postId: string, userId: string) {
  const post = await prisma.post.findFirst({
    where: { id: postId, status: PostStatus.PUBLISHED },
    select: { id: true },
  });
  if (!post) return null;

  await prisma.postReaction.upsert({
    where: {
      postId_userId_type: { postId, userId, type: ReactionType.LIKE },
    },
    update: {},
    create: { postId, userId, type: ReactionType.LIKE },
  });
  return getPost(postId, userId);
}

export async function removePostLike(postId: string, userId: string) {
  const post = await prisma.post.findFirst({
    where: { id: postId, status: PostStatus.PUBLISHED },
    select: { id: true },
  });
  if (!post) return null;

  await prisma.postReaction.deleteMany({
    where: { postId, userId, type: ReactionType.LIKE },
  });
  return getPost(postId, userId);
}

export async function reportPost(
  postId: string,
  reporterId: string,
  input: ReportPostInput,
) {
  const post = await prisma.post.findFirst({
    where: { id: postId, status: PostStatus.PUBLISHED },
    select: { id: true, authorId: true },
  });
  if (!post) return { kind: "not_found" as const };
  if (post.authorId === reporterId) return { kind: "own_post" as const };

  await prisma.postReport.upsert({
    where: { postId_reporterId: { postId, reporterId } },
    update: {
      reason: input.reason.toUpperCase() as PostReportReason,
      details: input.details,
      status: PostReportStatus.OPEN,
      moderatorId: null,
      moderatorNote: null,
      reviewedAt: null,
    },
    create: {
      postId,
      reporterId,
      reason: input.reason.toUpperCase() as PostReportReason,
      details: input.details,
    },
  });
  return { kind: "reported" as const };
}

export async function listReportedPosts() {
  const posts = await prisma.post.findMany({
    where: { reports: { some: { status: PostReportStatus.OPEN } } },
    include: {
      ...postInclude(),
      reports: {
        where: { status: PostReportStatus.OPEN },
        include: { reporter: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "asc" },
  });

  return posts.map((post) => ({
    ...mapPost(post),
    reports: post.reports.map((report) => ({
      id: report.id,
      reason: report.reason.toLowerCase(),
      details: report.details,
      reporter: report.reporter,
      createdAt: report.createdAt.toISOString(),
    })),
  }));
}

export async function moderateReportedPost(
  postId: string,
  moderatorId: string,
  input: ModeratePostInput,
) {
  const openReportCount = await prisma.postReport.count({
    where: { postId, status: PostReportStatus.OPEN },
  });
  if (openReportCount === 0) return { kind: "not_reported" as const };

  await prisma.$transaction([
    ...(input.decision === "hide"
      ? [
          prisma.post.update({
            where: { id: postId },
            data: { status: PostStatus.HIDDEN },
          }),
        ]
      : []),
    prisma.postReport.updateMany({
      where: { postId, status: PostReportStatus.OPEN },
      data: {
        status:
          input.decision === "hide"
            ? PostReportStatus.ACTIONED
            : PostReportStatus.DISMISSED,
        moderatorId,
        moderatorNote: input.note,
        reviewedAt: new Date(),
      },
    }),
  ]);

  return { kind: "updated" as const, decision: input.decision };
}
