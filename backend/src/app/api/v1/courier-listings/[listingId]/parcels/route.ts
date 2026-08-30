import { createParcelSchema } from "@/contracts/couriers";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { createParcel, listParcels } from "@/modules/couriers/couriers.service";

export const dynamic = "force-dynamic";
interface Context { params: Promise<{ listingId: string }> }

export async function GET(request: Request, context: Context) {
  const auth = await authenticate(request);
  if (!auth) return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  if (auth.user.role !== "organizer" || !auth.user.organizer) {
    return fail({ code: "ORGANIZER_REQUIRED", message: "An organizer account is required." }, 403);
  }
  const { listingId } = await context.params;
  try {
    const parcels = await listParcels(listingId, auth.user.organizer.id);
    return parcels ? ok(parcels) : fail({ code: "COURIER_NOT_FOUND", message: "Courier service not found." }, 404);
  } catch (error) {
    console.error(`Unable to list parcels for ${listingId}`, error);
    return fail({ code: "PARCELS_UNAVAILABLE", message: "Parcels are temporarily unavailable." }, 500);
  }
}

export async function POST(request: Request, context: Context) {
  const auth = await authenticate(request);
  if (!auth) return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  if (auth.user.role !== "organizer" || !auth.user.organizer) {
    return fail({ code: "ORGANIZER_REQUIRED", message: "An organizer account is required." }, 403);
  }
  const parsed = createParcelSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationFail(parsed.error.issues);
  const { listingId } = await context.params;
  try {
    const parcel = await createParcel(listingId, auth.user.organizer.id, auth.user.id, parsed.data);
    return parcel ? ok(parcel, { status: 201 }) : fail({ code: "COURIER_NOT_FOUND", message: "Courier service not found." }, 404);
  } catch (error) {
    console.error(`Unable to create parcel for ${listingId}`, error);
    return fail({ code: "PARCEL_CREATE_FAILED", message: "The parcel could not be created." }, 500);
  }
}

export function OPTIONS() { return preflight(); }
