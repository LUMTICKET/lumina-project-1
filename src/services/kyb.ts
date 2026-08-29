import { getToken } from "./auth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

async function kybFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getMyProfile() {
  return kybFetch("/api/kyb");
}

export async function createProfile(profile: any) {
  return kybFetch("/api/kyb", {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

export async function updateProfile(id: number, profile: any) {
  return kybFetch(`/api/kyb/${id}`, {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export async function deleteProfile(id: number) {
  return kybFetch(`/api/kyb/${id}`, { method: "DELETE" });
}