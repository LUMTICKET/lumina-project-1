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

interface AuthCtx {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuth: (mode?: "login" | "signup") => void;
  closeAuth: () => void;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const u = await getMe();
      setUserState(u);
    } catch {
      setUserState(null);
    } finally {
      setLoading(false);
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
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setUserState(null);
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