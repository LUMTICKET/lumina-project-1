import { createEventSchema, eventListQuerySchema } from "@/contracts/events";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { createEventDraft, listEvents } from "@/modules/events/events.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = eventListQuerySchema.safeParse(query);

  if (!parsed.success) {
    return validationFail(parsed.error.issues);
  }

  try {
    const result = await listEvents(parsed.data);
    return ok(result.items, undefined, { nextCursor: result.nextCursor });
  } catch (error) {
    console.error("Unable to list events", error);
    return fail(
      { code: "EVENTS_UNAVAILABLE", message: "Events are temporarily unavailable." },
      500,
    );
  }
}

export async function POST(request: Request) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail({ code: "INVALID_JSON", message: "A JSON body is required." }, 400);
  }

  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) return validationFail(parsed.error.issues);

  try {
    const event = await createEventDraft(parsed.data, auth.user.organizer.id);
    if (!event) {
      return fail({ code: "VENUE_NOT_FOUND", message: "Venue not found." }, 404);
    }
    return ok(event, { status: 201 });
  } catch (error) {
    console.error("Unable to create event draft", error);
    return fail(
      { code: "EVENT_CREATE_FAILED", message: "The event draft could not be created." },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
