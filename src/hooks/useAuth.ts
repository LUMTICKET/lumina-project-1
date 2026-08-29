import { useState, useEffect, useCallback } from "react";
import { User, getMe, removeToken } from "../services/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    setLoading(true);
    try {
      const u = await getMe();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const onAuthSuccess = useCallback((u: User) => {
    setUser(u);
  }, []);

  const onLogout = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  return { user, loading, onAuthSuccess, onLogout, refreshUser: checkUser };
}