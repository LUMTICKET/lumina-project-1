import { BusinessProfile } from '../components/settings/types';
import { getToken } from './auth';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

async function getAuthHeaders(extraHeaders: Record<string, string> = {}) {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
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
  if (typeof payload === 'object') {
    return payload as BusinessProfile;
  }
  return null;
}

/** GET /api/kyb — fetches the current logged-in user's business profile */
export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/kyb`, { headers });

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Failed to fetch business profile: ${response.status}`);
    }

    const data = await response.json();
    return normalizeBusinessProfile(data);
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return null;
  }
}

/** POST /api/kyb — creates a new profile (server sets id, userId, isVerified) */
export async function createProfile(
  profileData: Omit<BusinessProfile, 'id' | 'isVerified' | 'userId'>
): Promise<BusinessProfile> {
  const response = await fetch(`${API_BASE}/kyb`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Create failed: ${response.status}`);
  }

  return response.json();
}

/** PUT /api/kyb/:id — updates an existing profile */
export async function updateProfile(
  profileId: string | number,
  profileData: Partial<BusinessProfile>
): Promise<BusinessProfile> {
  const response = await fetch(`${API_BASE}/kyb/${profileId}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Update failed: ${response.status}`);
  }

  return response.json();
}

/** DELETE /api/kyb/:id */
export async function deleteProfile(profileId: string | number): Promise<void> {
  const response = await fetch(`${API_BASE}/kyb/${profileId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`);
  }
}
