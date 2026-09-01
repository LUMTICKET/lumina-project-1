import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { UserRole } from "@prisma/client";
import { POST as loginAccount } from "../src/app/api/v1/auth/login/route";
import { POST as registerAccount } from "../src/app/api/v1/auth/register/route";
import {
  GET as listEvents,
  POST as createEvent,
} from "../src/app/api/v1/events/route";
import { POST as submitEvent } from "../src/app/api/v1/events/[eventId]/submit/route";
import { POST as moderateEvent } from "../src/app/api/v1/admin/moderation/events/[eventId]/route";
import {
  GET as listPosts,
  POST as createPost,
} from "../src/app/api/v1/posts/route";
import { GET as getPost } from "../src/app/api/v1/posts/[postId]/route";
import { POST as addReaction } from "../src/app/api/v1/posts/[postId]/reactions/route";
import { POST as reportPost } from "../src/app/api/v1/posts/[postId]/reports/route";
import { GET as listReportedPosts } from "../src/app/api/v1/admin/moderation/posts/route";
import { POST as moderatePost } from "../src/app/api/v1/admin/moderation/posts/[postId]/route";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/modules/auth/password";

interface Envelope<T> {
  data: T;
  error?: { code?: string; message?: string };
}

interface Session {
  token: string;
  user: {
    id: string;
    organizer: { id: string } | null;
  };
}

interface EventDto {
  id: string;
  title: string;
  status: string;
}

interface PostDto {
  id: string;
  caption: string;
  reactionCount: number;
  viewerHasReacted: boolean;
}

const suffix = randomUUID();
const uniqueLabel = suffix.slice(0, 8);
const password = "Integration123!";
const emails = {
  organizer: `content-organizer-${suffix}@example.test`,
  customer: `content-customer-${suffix}@example.test`,
  admin: `content-admin-${suffix}@example.test`,
};
const userIds: string[] = [];
const organizerIds: string[] = [];
const eventIds: string[] = [];
const postIds: string[] = [];
const venueIds: string[] = [];

function request(
  path: string,
  method: "GET" | "POST",
  body?: unknown,
  token?: string,
) {
  return new Request(`http://localhost:3000/api/v1${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function payload<T>(response: Response) {
  return (await response.json()) as Envelope<T>;
}

async function register(
  email: string,
  accountType: "customer" | "organizer",
) {
  const response = await registerAccount(
    request("/auth/register", "POST", {
      name:
        accountType === "organizer"
          ? "Content Test Organizer"
          : "Content Test Customer",
      email,
      password,
      accountType,
    }),
  );
  assert.equal(response.status, 201);
  const session = (await payload<Session>(response)).data;
  userIds.push(session.user.id);
  if (session.user.organizer) organizerIds.push(session.user.organizer.id);
  return session;
}

async function createAdminSession() {
  const admin = await prisma.user.create({
    data: {
      name: "Content Test Admin",
      email: emails.admin,
      passwordHash: await hashPassword(password),
      role: UserRole.ADMIN,
    },
  });
  userIds.push(admin.id);

  const response = await loginAccount(
    request("/auth/login", "POST", {
      email: emails.admin,
      password,
    }),
  );
  assert.equal(response.status, 200);
  return (await payload<Session>(response)).data;
}

after(async () => {
  await prisma.post.deleteMany({ where: { id: { in: postIds } } });
  await prisma.event.deleteMany({ where: { id: { in: eventIds } } });
  await prisma.venue.deleteMany({ where: { id: { in: venueIds } } });
  await prisma.organizer.deleteMany({ where: { id: { in: organizerIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

test("event and feed APIs enforce publishing and moderation boundaries", async () => {
  const organizer = await register(emails.organizer, "organizer");
  const customer = await register(emails.customer, "customer");
  const admin = await createAdminSession();

  const venue = await prisma.venue.create({
    data: {
      name: `Integration Venue ${uniqueLabel}`,
      address: "1 Test Avenue",
      city: "Blantyre",
    },
  });
  venueIds.push(venue.id);

  const eventInput = {
    title: `Integration Event ${uniqueLabel}`,
    subtitle: "A contract-test event",
    venueId: venue.id,
    startsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    description: "An event used to verify draft visibility and moderation contracts.",
    tags: ["integration", "events"],
    maxPerUser: 4,
    ticketTiers: [
      {
        name: "General",
        priceMinor: 100_000,
        currency: "MWK",
        capacity: 50,
        perks: ["General admission"],
      },
    ],
  };

  const forbiddenCreate = await createEvent(
    request("/events", "POST", eventInput, customer.token),
  );
  assert.equal(forbiddenCreate.status, 403);

  const createEventResponse = await createEvent(
    request("/events", "POST", eventInput, organizer.token),
  );
  assert.equal(createEventResponse.status, 201);
  const event = (await payload<EventDto>(createEventResponse)).data;
  eventIds.push(event.id);
  assert.equal(event.status, "draft");

  const privateDraftResponse = await listEvents(
    request(`/events?q=${encodeURIComponent(uniqueLabel)}`, "GET"),
  );
  assert.equal(privateDraftResponse.status, 200);
  assert.equal(
    (await payload<EventDto[]>(privateDraftResponse)).data.some(
      (item) => item.id === event.id,
    ),
    false,
  );

  const forbiddenSubmit = await submitEvent(
    request(`/events/${event.id}/submit`, "POST", undefined, customer.token),
    { params: Promise.resolve({ eventId: event.id }) },
  );
  assert.equal(forbiddenSubmit.status, 403);

  const submitResponse = await submitEvent(
    request(`/events/${event.id}/submit`, "POST", undefined, organizer.token),
    { params: Promise.resolve({ eventId: event.id }) },
  );
  assert.equal(submitResponse.status, 200);
  assert.equal((await payload<EventDto>(submitResponse)).data.status, "pending_review");

  const forbiddenModeration = await moderateEvent(
    request(
      `/admin/moderation/events/${event.id}`,
      "POST",
      { decision: "approve" },
      customer.token,
    ),
    { params: Promise.resolve({ eventId: event.id }) },
  );
  assert.equal(forbiddenModeration.status, 403);

  const approveResponse = await moderateEvent(
    request(
      `/admin/moderation/events/${event.id}`,
      "POST",
      { decision: "approve", note: "Verified by the integration contract test." },
      admin.token,
    ),
    { params: Promise.resolve({ eventId: event.id }) },
  );
  assert.equal(approveResponse.status, 200);
  assert.equal((await payload<EventDto>(approveResponse)).data.status, "published");

  const publishedEventsResponse = await listEvents(
    request(`/events?q=${encodeURIComponent(uniqueLabel)}`, "GET"),
  );
  assert.equal(publishedEventsResponse.status, 200);
  assert.ok(
    (await payload<EventDto[]>(publishedEventsResponse)).data.some(
      (item) => item.id === event.id,
    ),
  );

  const caption = `Integration feed post ${suffix}`;
  const createPostResponse = await createPost(
    request(
      "/posts",
      "POST",
      {
        caption,
        location: "Blantyre",
        tags: ["integration", "feed"],
        eventId: event.id,
        media: [
          {
            type: "image",
            url: "https://example.com/integration-event.jpg",
            altText: "Integration event poster",
          },
        ],
      },
      organizer.token,
    ),
  );
  assert.equal(createPostResponse.status, 201);
  const post = (await payload<PostDto>(createPostResponse)).data;
  postIds.push(post.id);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const reactionResponse = await addReaction(
      request(
        `/posts/${post.id}/reactions`,
        "POST",
        undefined,
        customer.token,
      ),
      { params: Promise.resolve({ postId: post.id }) },
    );
    assert.equal(reactionResponse.status, 200);
    const reactedPost = (await payload<PostDto>(reactionResponse)).data;
    assert.equal(reactedPost.reactionCount, 1);
    assert.equal(reactedPost.viewerHasReacted, true);
  }

  const ownReportResponse = await reportPost(
    request(
      `/posts/${post.id}/reports`,
      "POST",
      { reason: "spam", details: "Authors cannot report their own posts." },
      organizer.token,
    ),
    { params: Promise.resolve({ postId: post.id }) },
  );
  assert.equal(ownReportResponse.status, 409);

  const reportResponse = await reportPost(
    request(
      `/posts/${post.id}/reports`,
      "POST",
      { reason: "misleading", details: "Reported by the integration contract test." },
      customer.token,
    ),
    { params: Promise.resolve({ postId: post.id }) },
  );
  assert.equal(reportResponse.status, 200);

  const moderationQueueResponse = await listReportedPosts(
    request("/admin/moderation/posts", "GET", undefined, admin.token),
  );
  assert.equal(moderationQueueResponse.status, 200);
  assert.ok(
    (await payload<PostDto[]>(moderationQueueResponse)).data.some(
      (item) => item.id === post.id,
    ),
  );

  const forbiddenPostModeration = await moderatePost(
    request(
      `/admin/moderation/posts/${post.id}`,
      "POST",
      { decision: "hide", note: "This content should be hidden after review." },
      customer.token,
    ),
    { params: Promise.resolve({ postId: post.id }) },
  );
  assert.equal(forbiddenPostModeration.status, 403);

  const hideResponse = await moderatePost(
    request(
      `/admin/moderation/posts/${post.id}`,
      "POST",
      { decision: "hide", note: "This content should be hidden after review." },
      admin.token,
    ),
    { params: Promise.resolve({ postId: post.id }) },
  );
  assert.equal(hideResponse.status, 200);

  const hiddenDetailResponse = await getPost(
    request(`/posts/${post.id}`, "GET"),
    { params: Promise.resolve({ postId: post.id }) },
  );
  assert.equal(hiddenDetailResponse.status, 404);

  const publicPostsResponse = await listPosts(
    request(`/posts?q=${encodeURIComponent(suffix)}`, "GET"),
  );
  assert.equal(publicPostsResponse.status, 200);
  assert.equal(
    (await payload<PostDto[]>(publicPostsResponse)).data.some(
      (item) => item.id === post.id,
    ),
    false,
  );
});
