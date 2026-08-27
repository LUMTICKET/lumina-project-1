import { apiRequest } from "./client";

export type AccountType = "customer" | "organizer";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AccountType | "admin";
  organizer: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

export interface AuthSessionResult {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  accountType: AccountType;
}) {
  return apiRequest<AuthSessionResult>("/auth/register", {
    method: "POST",
    body: input,
  });
}

export function loginAccount(input: { email: string; password: string }) {
  return apiRequest<AuthSessionResult>("/auth/login", {
    method: "POST",
    body: input,
  });
}

export function fetchCurrentUser(token: string) {
  return apiRequest<AuthUser>("/auth/me", { token });
}

export function logoutAccount(token: string) {
  return apiRequest<null>("/auth/logout", { method: "POST", token });
}
