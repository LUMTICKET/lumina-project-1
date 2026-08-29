// /workspaces/lumina-project-1/src/services/kyb.ts
import { BusinessProfile } from "../components/settings/types";
import { getMe, getToken } from "./auth";

// Mock implementation - replace with actual API calls
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

async function getAuthHeaders(extraHeaders: Record<string, string> = {}) {
  const token = await getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

function normalizeBusinessProfile(payload: unknown): BusinessProfile | null {
  if (!payload) return null;

  if (Array.isArray(payload)) {
    const [first] = payload;
    return first ? (first as BusinessProfile) : null;
  }

  if (typeof payload === "object") {
    return payload as BusinessProfile;
  }

  return null;
}

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  try {
    const user = await getMe();
    if (!user) {
      console.log("No user logged in");
      return null;
    }

    const headers = await getAuthHeaders();
    const candidates = [
      `${API_BASE}/kyb/profile/me`,
      `${API_BASE}/kyb/profile?userId=${encodeURIComponent(user.id)}`,
      `${API_BASE}/kyb/profile/${user.id}`,
    ];

    for (const url of candidates) {
      const response = await fetch(url, { headers });

      if (response.status === 404) {
        continue;
      }

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const profile = normalizeBusinessProfile(data);
      if (profile) {
        return profile;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching business profile:", error);
    return null;
  }
}

export async function createProfile(profileData: Omit<BusinessProfile, "id">): Promise<BusinessProfile> {
  try {
    const user = await getMe();
    if (!user) {
      throw new Error("No user logged in");
    }

    const response = await fetch(`${API_BASE}/kyb/profile`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        ...profileData,
        userId: user.id,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create business profile");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating business profile:", error);
    throw error;
  }
}

export async function updateProfile(profileId: string, profileData: Partial<BusinessProfile>): Promise<BusinessProfile> {
  try {
    const user = await getMe();
    if (!user) {
      throw new Error("No user logged in");
    }

    const response = await fetch(`${API_BASE}/kyb/profile/${profileId}`, {
      method: "PUT",
      headers: await getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error("Failed to update business profile");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating business profile:", error);
    throw error;
  }
}