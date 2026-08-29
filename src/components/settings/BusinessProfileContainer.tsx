import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createProfile, updateProfile } from "../../services/kyb";
import { BusinessProfile } from "./types";
import BusinessProfileForm from "./BusinessProfileForm";
import BusinessProfilePage from "./BusinessProfilePage";

interface Props {
  onBack: () => void;
}

export default function BusinessProfileContainer({ onBack }: Props) {
  const { businessProfile, refreshBusinessProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (profile: BusinessProfile) => {
    try {
      if (businessProfile?.id) {
        // Update existing (use the real DB id from context)
        await updateProfile(businessProfile.id, profile);
      } else {
        // Create new — strip fields the server manages itself
        const { id, isVerified, userId, ...payload } = profile as any;
        await createProfile(payload);
      }

      // Refresh context so the whole app sees the new/updated profile
      await refreshBusinessProfile();
      setIsEditing(false);
    } catch (err: any) {
      // Re-throw so the form can show it if you later add an error banner there
      console.error("BusinessProfile save error:", err);
      throw err;
    }
  };

  if (isEditing) {
    return (
      <BusinessProfileForm
        existing={businessProfile}
        onBack={() => setIsEditing(false)}
        onSave={handleSave}
      />
    );
  }

  return (
    <BusinessProfilePage
      profile={businessProfile}
      onBack={onBack}
      onEdit={() => setIsEditing(true)}
    />
  );
}