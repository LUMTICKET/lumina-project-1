import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type AccountType,
  type AuthUser,
  fetchCurrentUser,
  loginAccount,
  logoutAccount,
  registerAccount,
} from "../api/auth";
import {
  clearSessionToken,
  readSessionToken,
  writeSessionToken,
} from "./session-storage";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    accountType: AccountType,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void readSessionToken()
      .then(async (storedToken) => {
        if (!storedToken) return;
        const currentUser = await fetchCurrentUser(storedToken);
        if (!active) return;
        setToken(storedToken);
        setUser(currentUser);
      })
      .catch(async () => {
        await clearSessionToken();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const acceptSession = async (result: Awaited<ReturnType<typeof loginAccount>>) => {
    await writeSessionToken(result.token);
    setToken(result.token);
    setUser(result.user);
  };

  const login = async (email: string, password: string) => {
    await acceptSession(await loginAccount({ email, password }));
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    accountType: AccountType,
  ) => {
    await acceptSession(
      await registerAccount({ name, email, password, accountType }),
    );
  };

  const logout = async () => {
    if (token) {
      try {
        await logoutAccount(token);
      } catch {
        // Local logout still succeeds if the API is unavailable.
      }
    }
    await clearSessionToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
