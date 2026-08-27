import { apiRequest } from "./client";

export interface ApiTicketTier {
  id: string;
  name: string;
  priceMinor: number;
  currency: string;
  capacity: number;
  available: number;
  perks: string[];
}

export interface ApiEvent {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  organizer: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
  };
  startsAt: string;
  endsAt: string | null;
  description: string;
  tags: string[];
  status: string;
  maxPerUser: number;
  ticketTiers: ApiTicketTier[];
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>(path, { signal });
}

interface EventQuery {
  q?: string;
  city?: string;
  signal?: AbortSignal;
}

export function fetchEvents({ q, city, signal }: EventQuery = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (city) params.set("city", city);
  const query = params.toString();

  return getJson<ApiEvent[]>(`/events${query ? `?${query}` : ""}`, signal);
}

export function fetchEventById(eventId: string, signal?: AbortSignal) {
  return getJson<ApiEvent>(`/events/${encodeURIComponent(eventId)}`, signal);
}
