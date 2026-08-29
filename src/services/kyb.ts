// /workspaces/lumina-project-1/src/services/kyb.ts
import { BusinessProfile } from "../components/settings/types";
import { getMe } from "./auth";

// Mock implementation - replace with actual API calls
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  try {
    // Get current user first
    const user = await getMe();
    if (!user) {
      console.log('No user logged in');
      return null;
    }

    // Fetch business profile for the logged-in user
    const response = await fetch(`${API_BASE}/kyb/profile/${user.id}`);
    
    if (response.status === 404) {
      return null; // No profile exists
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch business profile');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return null;
  }
}

export async function createProfile(profileData: Omit<BusinessProfile, 'id'>): Promise<BusinessProfile> {
  try {
    const user = await getMe();
    if (!user) {
      throw new Error('No user logged in');
    }

    const response = await fetch(`${API_BASE}/kyb/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...profileData,
        userId: user.id,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create business profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating business profile:', error);
    throw error;
  }
}

export async function updateProfile(profileId: string, profileData: Partial<BusinessProfile>): Promise<BusinessProfile> {
  try {
    const user = await getMe();
    if (!user) {
      throw new Error('No user logged in');
    }

    const response = await fetch(`${API_BASE}/kyb/profile/${profileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update business profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating business profile:', error);
    throw error;
  }
}