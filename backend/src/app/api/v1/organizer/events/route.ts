import { fail, ok, preflight } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { listOrganizerEvents } from "@/modules/events/events.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (!auth) {
    return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  }
  if (auth.user.role !== "organizer" || !auth.user.organizer) {
    return fail(
      { code: "ORGANIZER_REQUIRED", message: "An organizer account is required." },
      403,
    );
  }

  try {
    return ok(await listOrganizerEvents(auth.user.organizer.id));
  } catch (error) {
    console.error("Unable to list organizer events", error);
    return fail(
      { code: "ORGANIZER_EVENTS_UNAVAILABLE", message: "Your events are unavailable." },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
