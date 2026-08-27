import { apiRequest } from "./client";

export interface ApiVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  eventCount: number;
}

interface VenueQuery {
  q?: string;
  city?: string;
  signal?: AbortSignal;
}

export function fetchVenues({ q, city, signal }: VenueQuery = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (city) params.set("city", city);
  const query = params.toString();

  return apiRequest<ApiVenue[]>(`/venues${query ? `?${query}` : ""}`, { signal });
}

export function fetchVenueById(venueId: string, signal?: AbortSignal) {
  return apiRequest<ApiVenue>(`/venues/${encodeURIComponent(venueId)}`, { signal });
}
