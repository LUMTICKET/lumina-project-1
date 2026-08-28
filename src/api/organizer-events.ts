import type { ApiEvent } from "./events";
import { apiRequest } from "./client";

export interface CreateEventDraftInput {
  title: string;
  subtitle?: string;
  venueId: string;
  startsAt: string;
  endsAt?: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  maxPerUser: number;
  ticketTiers: {
    name: string;
    priceMinor: number;
    currency: string;
    capacity: number;
    available?: number;
    perks: string[];
  }[];
}

export function createEventDraft(input: CreateEventDraftInput, token: string) {
  return apiRequest<ApiEvent>("/events", { method: "POST", body: input, token });
}

export function updateEventDraft(
  eventId: string,
  input: CreateEventDraftInput,
  token: string,
) {
  return apiRequest<ApiEvent>(`/events/${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    body: input,
    token,
  });
}

export function fetchOrganizerEvents(token: string, signal?: AbortSignal) {
  return apiRequest<ApiEvent[]>("/organizer/events", { token, signal });
}

export function submitEventDraft(eventId: string, token: string) {
  return apiRequest<ApiEvent>(`/events/${encodeURIComponent(eventId)}/submit`, {
    method: "POST",
    token,
  });
}
