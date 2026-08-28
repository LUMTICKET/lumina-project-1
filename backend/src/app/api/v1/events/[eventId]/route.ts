import { updateEventSchema } from "@/contracts/events";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import {
  getEventById,
  updateEventDraft,
} from "@/modules/events/events.service";

export const dynamic = "force-dynamic";

interface EventRouteContext {
  params: Promise<{ eventId: string }>;
}

export async function GET(_request: Request, context: EventRouteContext) {
  const { eventId } = await context.params;

  try {
    const event = await getEventById(eventId);

    if (!event) {
      return fail({ code: "EVENT_NOT_FOUND", message: "Event not found." }, 404);
    }

    return ok(event);
  } catch (error) {
    console.error(`Unable to load event ${eventId}`, error);
    return fail(
      { code: "EVENT_UNAVAILABLE", message: "The event is temporarily unavailable." },
      500,
    );
  }
}

export async function PATCH(request: Request, context: EventRouteContext) {
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

  const parsed = updateEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationFail(parsed.error.issues);

  const { eventId } = await context.params;
  try {
    const result = await updateEventDraft(
      eventId,
      auth.user.organizer.id,
      parsed.data,
    );
    if (result.kind === "not_found") {
      return fail({ code: "EVENT_NOT_FOUND", message: "Event not found." }, 404);
    }
    if (result.kind === "not_editable") {
      return fail(
        {
          code: "EVENT_NOT_EDITABLE",
          message: "Only draft or rejected events can be edited.",
        },
        409,
      );
    }
    if (result.kind === "venue_not_found") {
      return fail({ code: "VENUE_NOT_FOUND", message: "Venue not found." }, 404);
    }
    if (result.kind === "invalid_schedule") {
      return fail(
        {
          code: "INVALID_EVENT_SCHEDULE",
          message: "Event end time must be after its start time.",
        },
        400,
      );
    }
    return ok(result.event);
  } catch (error) {
    console.error(`Unable to update event ${eventId}`, error);
    return fail(
      { code: "EVENT_UPDATE_FAILED", message: "The event could not be updated." },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
