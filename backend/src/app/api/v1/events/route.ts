import { eventListQuerySchema } from "@/contracts/events";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { listEvents } from "@/modules/events/events.service";

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

export function OPTIONS() {
  return preflight();
}
