import { apiRequest } from "./client";

export type CourierServiceLevel = "same_day" | "next_day" | "standard";
export type ParcelStatus =
  | "created"
  | "received"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception"
  | "cancelled";

export interface ApiCourierListing {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
  organizer: { id: string; name: string; avatarUrl: string | null };
  serviceAreas: string[];
  serviceLevels: CourierServiceLevel[];
  basePriceMinor: number;
  currency: string;
  estimatedMinHours: number;
  estimatedMaxHours: number;
  status: "active" | "inactive";
}

export interface ApiTrackingEvent {
  id: string;
  status: ParcelStatus;
  location: string | null;
  message: string;
  occurredAt: string;
}

export interface ApiParcelTracking {
  id: string;
  trackingCode: string;
  courier: ApiCourierListing;
  origin: string;
  destination: string;
  status: ParcelStatus;
  estimatedDelivery: string | null;
  createdAt: string;
  events: ApiTrackingEvent[];
}

export interface CreateCourierListingInput {
  name: string;
  description: string;
  serviceAreas: string[];
  serviceLevels: CourierServiceLevel[];
  basePriceMinor: number;
  currency: string;
  estimatedMinHours: number;
  estimatedMaxHours: number;
}

export interface CreateParcelInput {
  origin: string;
  destination: string;
  recipientName: string;
  recipientContact: string;
  contentsDescription?: string;
  estimatedDelivery?: string;
}

export interface CreateTrackingEventInput {
  status: Exclude<ParcelStatus, "created">;
  location?: string;
  message: string;
}

export function fetchCourierListings({
  q,
  serviceArea,
  signal,
}: { q?: string; serviceArea?: string; signal?: AbortSignal } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (serviceArea) params.set("serviceArea", serviceArea);
  const query = params.toString();
  return apiRequest<ApiCourierListing[]>(
    `/courier-listings${query ? `?${query}` : ""}`,
    { signal },
  );
}

export function trackParcel(trackingCode: string, signal?: AbortSignal) {
  return apiRequest<ApiParcelTracking>(
    `/parcels/track/${encodeURIComponent(trackingCode.trim())}`,
    { signal },
  );
}

export function fetchOrganizerCourierListings(
  token: string,
  signal?: AbortSignal,
) {
  return apiRequest<ApiCourierListing[]>("/organizer/courier-listings", {
    token,
    signal,
  });
}

export function createCourierListing(
  input: CreateCourierListingInput,
  token: string,
) {
  return apiRequest<ApiCourierListing>("/courier-listings", {
    method: "POST",
    body: input,
    token,
  });
}

export function fetchCourierParcels(
  listingId: string,
  token: string,
  signal?: AbortSignal,
) {
  return apiRequest<ApiParcelTracking[]>(
    `/courier-listings/${encodeURIComponent(listingId)}/parcels`,
    { token, signal },
  );
}

export function createCourierParcel(
  listingId: string,
  input: CreateParcelInput,
  token: string,
) {
  return apiRequest<ApiParcelTracking>(
    `/courier-listings/${encodeURIComponent(listingId)}/parcels`,
    { method: "POST", body: input, token },
  );
}

export function addCourierTrackingEvent(
  parcelId: string,
  input: CreateTrackingEventInput,
  token: string,
) {
  return apiRequest<ApiParcelTracking>(
    `/parcels/${encodeURIComponent(parcelId)}/tracking-events`,
    { method: "POST", body: input, token },
  );
}
