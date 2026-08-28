import { fail, ok, preflight } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { listPendingModerationEvents } from "@/modules/events/events.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (!auth) {
    return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  }
  if (auth.user.role !== "admin") {
    return fail({ code: "ADMIN_REQUIRED", message: "Administrator access is required." }, 403);
  }

  try {
    return ok(await listPendingModerationEvents());
  } catch (error) {
    console.error("Unable to list events awaiting moderation", error);
    return fail(
      { code: "MODERATION_QUEUE_UNAVAILABLE", message: "The moderation queue is unavailable." },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
