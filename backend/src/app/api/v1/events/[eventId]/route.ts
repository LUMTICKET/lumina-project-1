import { fail, ok, preflight } from "@/lib/api-response";
import { getEventById } from "@/modules/events/events.service";

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

export function OPTIONS() {
  return preflight();
}
