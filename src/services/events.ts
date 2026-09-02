import { getToken } from "./auth";

const API_BASE = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export interface CreatedEvent {
  id: string | number;
  title: string;
  category?: string;
  startsAt?: string;
  date?: string;
  status?: string;
}

export async function getCreatedEvents(businessProfileId: string | number): Promise<CreatedEvent[]> {
  const token = await getToken();
  if (!token) throw new Error("Please log in again before loading ticket history.");

  const response = await fetch(
    `${API_BASE}/api/events?businessProfileId=${encodeURIComponent(String(businessProfileId))}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Could not load ticket history (${response.status})`);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.data)) return data.data;
  return [];
}
