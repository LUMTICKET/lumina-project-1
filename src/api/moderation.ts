import { apiRequest } from "./client";
import type { ApiEvent } from "./events";

export function fetchEventModerationQueue(token: string, signal?: AbortSignal) {
  return apiRequest<ApiEvent[]>("/admin/moderation/events", { token, signal });
}

export function moderateEvent(
  eventId: string,
  input:
    | { decision: "approve"; note?: string }
    | { decision: "reject"; note: string },
  token: string,
) {
  return apiRequest<ApiEvent>(
    `/admin/moderation/events/${encodeURIComponent(eventId)}`,
    { method: "POST", body: input, token },
  );
}
