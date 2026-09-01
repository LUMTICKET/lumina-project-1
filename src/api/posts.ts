import { apiRequest } from "./client";

export interface ApiPostMedia {
  id: string;
  type: "image" | "video";
  url: string;
  altText: string | null;
}

export interface ApiPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  caption: string;
  location: string | null;
  priceLabel: string | null;
  dateLabel: string | null;
  tags: string[];
  status: string;
  media: ApiPostMedia[];
  event: { id: string; title: string } | null;
  reactionCount: number;
  viewerHasReacted: boolean;
  publishedAt: string;
}

export interface ReportedApiPost extends ApiPost {
  reports: {
    id: string;
    reason: string;
    details: string | null;
    reporter: { id: string; name: string };
    createdAt: string;
  }[];
}

export function fetchPosts({
  q,
  token,
  signal,
}: {
  q?: string;
  token?: string | null;
  signal?: AbortSignal;
} = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  const query = params.toString();
  return apiRequest<ApiPost[]>(`/posts${query ? `?${query}` : ""}`, {
    token: token ?? undefined,
    signal,
  });
}

export function createPost(
  input: {
    caption: string;
    location?: string;
    priceLabel?: string;
    dateLabel?: string;
    tags: string[];
    eventId?: string;
    media: { type: "image" | "video"; url: string; altText?: string }[];
  },
  token: string,
) {
  return apiRequest<ApiPost>("/posts", { method: "POST", body: input, token });
}

export function likePost(postId: string, token: string) {
  return apiRequest<ApiPost>(`/posts/${encodeURIComponent(postId)}/reactions`, {
    method: "POST",
    token,
  });
}

export function unlikePost(postId: string, token: string) {
  return apiRequest<ApiPost>(`/posts/${encodeURIComponent(postId)}/reactions`, {
    method: "DELETE",
    token,
  });
}

export function reportPost(
  postId: string,
  input: {
    reason: "spam" | "misleading" | "abuse" | "other";
    details?: string;
  },
  token: string,
) {
  return apiRequest<{ reported: boolean }>(
    `/posts/${encodeURIComponent(postId)}/reports`,
    { method: "POST", body: input, token },
  );
}

export function fetchPostModerationQueue(token: string, signal?: AbortSignal) {
  return apiRequest<ReportedApiPost[]>("/admin/moderation/posts", { token, signal });
}

export function moderatePost(
  postId: string,
  input:
    | { decision: "dismiss"; note?: string }
    | { decision: "hide"; note: string },
  token: string,
) {
  return apiRequest<{ decision: "dismiss" | "hide" }>(
    `/admin/moderation/posts/${encodeURIComponent(postId)}`,
    { method: "POST", body: input, token },
  );
}
