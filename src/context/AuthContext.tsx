// /workspaces/lumina-project-1/src/context/AuthContext.tsx
import AuthModal from "@/components/AuthModal";
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { User, getMe, removeToken } from "../services/auth";
import { BusinessProfile } from "../components/settings/types";
import { getBusinessProfile } from "../services/kyb";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuth: (mode?: "login" | "signup") => void;
  closeAuth: () => void;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  businessProfile: BusinessProfile | null;
  refreshBusinessProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const u = await getMe();
      setUserState(u);
      
      // If user is logged in, fetch their business profile
      if (u) {
        try {
          const profile = await getBusinessProfile();
          setBusinessProfile(profile);
        } catch (error) {
          console.error('Failed to fetch business profile:', error);
          setBusinessProfile(null);
        }
      } else {
        setBusinessProfile(null);
      }
    } catch {
      setUserState(null);
      setBusinessProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBusinessProfile = useCallback(async () => {
    try {
      const profile = await getBusinessProfile();
      setBusinessProfile(profile);
    } catch (error) {
      console.error('Failed to refresh business profile:', error);
      setBusinessProfile(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openAuth = useCallback((mode: "login" | "signup" = "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (!u) {
      setBusinessProfile(null);
    }
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setUserState(null);
    setBusinessProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen: authModalOpen,
        openAuth,
        closeAuth,
        setUser,
        logout,
        refreshUser,
        businessProfile,
        refreshBusinessProfile,
      }}
    >
      {children}

      <AuthModal
        visible={authModalOpen}
        onClose={closeAuth}
        initialMode={authMode}
        onAuthSuccess={(u) => {
          setUserState(u);
          closeAuth();
          // Refresh business profile after successful authentication
          refreshBusinessProfile();
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}