import { fail, ok, preflight } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (!auth) {
    return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  }
  return ok(auth.user);
}

export function OPTIONS() {
  return preflight();
}
