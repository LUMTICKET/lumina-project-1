import { moderateEventSchema } from "@/contracts/events";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { moderateEvent } from "@/modules/events/events.service";

interface ModerationRouteContext {
  params: Promise<{ eventId: string }>;
}

export async function POST(request: Request, context: ModerationRouteContext) {
  const auth = await authenticate(request);
  if (!auth) {
    return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  }
  if (auth.user.role !== "admin") {
    return fail({ code: "ADMIN_REQUIRED", message: "Administrator access is required." }, 403);
  }

  const parsed = moderateEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationFail(parsed.error.issues);

  const { eventId } = await context.params;
  try {
    const result = await moderateEvent(eventId, auth.user.id, parsed.data);
    if (result.kind === "not_found") {
      return fail({ code: "EVENT_NOT_FOUND", message: "Event not found." }, 404);
    }
    if (result.kind === "not_pending") {
      return fail(
        {
          code: "EVENT_NOT_PENDING_REVIEW",
          message: "Only events awaiting review can be moderated.",
        },
        409,
      );
    }
    return ok(result.event);
  } catch (error) {
    console.error(`Unable to moderate event ${eventId}`, error);
    return fail(
      { code: "EVENT_MODERATION_FAILED", message: "The review could not be saved." },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
