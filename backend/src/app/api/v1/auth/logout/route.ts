import { ok, preflight } from "@/lib/api-response";
import { logout } from "@/modules/auth/auth.service";

export async function POST(request: Request) {
  await logout(request);
  return ok(null);
}

export function OPTIONS() {
  return preflight();
}
