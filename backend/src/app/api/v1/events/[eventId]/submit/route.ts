import { fail, ok, preflight } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { submitEventForReview } from "@/modules/events/events.service";

interface SubmitRouteContext {
  params: Promise<{ eventId: string }>;
}

export async function POST(request: Request, context: SubmitRouteContext) {
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

  const { eventId } = await context.params;
  try {
    const event = await submitEventForReview(eventId, auth.user.organizer.id);
    if (!event) {
      return fail(
        { code: "DRAFT_NOT_FOUND", message: "An owned event draft was not found." },
        404,
      );
    }
    return ok(event);
  } catch (error) {
    console.error(`Unable to submit event ${eventId}`, error);
    return fail(
      { code: "EVENT_SUBMIT_FAILED", message: "The event could not be submitted." },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
