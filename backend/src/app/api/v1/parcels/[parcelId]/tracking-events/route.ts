import { createTrackingEventSchema } from "@/contracts/couriers";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { addTrackingEvent } from "@/modules/couriers/couriers.service";

export const dynamic = "force-dynamic";
interface Context { params: Promise<{ parcelId: string }> }

export async function POST(request: Request, context: Context) {
  const auth = await authenticate(request);
  if (!auth) return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  if (auth.user.role !== "organizer" || !auth.user.organizer) {
    return fail({ code: "ORGANIZER_REQUIRED", message: "An organizer account is required." }, 403);
  }
  const parsed = createTrackingEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationFail(parsed.error.issues);
  const { parcelId } = await context.params;
  try {
    const result = await addTrackingEvent(parcelId, auth.user.organizer.id, auth.user.id, parsed.data);
    if (result.kind === "not_found") return fail({ code: "PARCEL_NOT_FOUND", message: "Parcel not found." }, 404);
    if (result.kind === "invalid_transition") return fail({ code: "INVALID_PARCEL_TRANSITION", message: "That parcel status transition is not allowed." }, 409);
    return ok(result.parcel);
  } catch (error) {
    console.error(`Unable to add tracking event for ${parcelId}`, error);
    return fail({ code: "TRACKING_UPDATE_FAILED", message: "The tracking update could not be saved." }, 500);
  }
}

export function OPTIONS() { return preflight(); }
