import { updateCourierListingSchema } from "@/contracts/couriers";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { getCourierListing, updateCourierListing } from "@/modules/couriers/couriers.service";

export const dynamic = "force-dynamic";
interface Context { params: Promise<{ listingId: string }> }

export async function GET(_request: Request, context: Context) {
  const { listingId } = await context.params;
  try {
    const listing = await getCourierListing(listingId);
    return listing ? ok(listing) : fail({ code: "COURIER_NOT_FOUND", message: "Courier service not found." }, 404);
  } catch (error) {
    console.error(`Unable to load courier service ${listingId}`, error);
    return fail({ code: "COURIER_UNAVAILABLE", message: "The courier service is temporarily unavailable." }, 500);
  }
}

export async function PATCH(request: Request, context: Context) {
  const auth = await authenticate(request);
  if (!auth) return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  if (auth.user.role !== "organizer" || !auth.user.organizer) {
    return fail({ code: "ORGANIZER_REQUIRED", message: "An organizer account is required." }, 403);
  }
  const parsed = updateCourierListingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationFail(parsed.error.issues);
  const { listingId } = await context.params;
  try {
    const result = await updateCourierListing(listingId, auth.user.organizer.id, parsed.data);
    if (result.kind === "not_found") return fail({ code: "COURIER_NOT_FOUND", message: "Courier service not found." }, 404);
    if (result.kind === "invalid_estimate") return fail({ code: "INVALID_DELIVERY_ESTIMATE", message: "Maximum delivery time cannot be shorter than minimum delivery time." }, 400);
    return ok(result.listing);
  } catch (error) {
    console.error(`Unable to update courier service ${listingId}`, error);
    return fail({ code: "COURIER_UPDATE_FAILED", message: "The courier service could not be updated." }, 500);
  }
}

export function OPTIONS() { return preflight(); }
