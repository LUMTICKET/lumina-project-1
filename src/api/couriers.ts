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
