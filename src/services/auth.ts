import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: point this at your Next.js API
const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = "lumticket_auth_token";

/* ---------- token storage ---------- */
export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function removeToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

/* ---------- helpers ---------- */
async function handleRes(res: Response) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.json();
}

async function requestAuth(path: string, init: RequestInit): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, init);
    const data = await handleRes(res);
    await saveToken(data.token);
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Failed auth");
    }
    throw error;
  }
}

/* ---------- auth API ---------- */
export async function signup(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  return requestAuth("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      name: name.trim(),
    }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return requestAuth("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
}

export async function googleAuth(
  idToken: string,
  email: string,
  name?: string,
  avatar?: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, email, name, avatar }),
  });
  const data = await handleRes(res);
  await saveToken(data.token);
  return data;
}

/** Call /api/auth/me to get the currently logged-in user */
export async function getMe(): Promise<User | null> {
  const token = await getToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 || res.status === 404) {
    await removeToken();
    return null;
  }

  const data = await handleRes(res);
  return data;
}

export async function logout() {
  await removeToken();
}

/* ---------- small JWT payload decoder (no lib needed) ---------- */
export function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}