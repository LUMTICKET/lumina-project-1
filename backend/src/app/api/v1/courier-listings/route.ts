import { courierListQuerySchema, createCourierListingSchema } from "@/contracts/couriers";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { createCourierListing, listCourierListings } from "@/modules/couriers/couriers.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const parsed = courierListQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.success) return validationFail(parsed.error.issues);
  try {
    const result = await listCourierListings(parsed.data);
    return ok(result.items, undefined, { nextCursor: result.nextCursor });
  } catch (error) {
    console.error("Unable to list courier services", error);
    return fail({ code: "COURIERS_UNAVAILABLE", message: "Courier services are temporarily unavailable." }, 500);
  }
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (!auth) return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  if (auth.user.role !== "organizer" || !auth.user.organizer) {
    return fail({ code: "ORGANIZER_REQUIRED", message: "An organizer account is required." }, 403);
  }
  const parsed = createCourierListingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationFail(parsed.error.issues);
  try {
    return ok(await createCourierListing(auth.user.organizer.id, parsed.data), { status: 201 });
  } catch (error) {
    console.error("Unable to create courier service", error);
    return fail({ code: "COURIER_CREATE_FAILED", message: "The courier service could not be created." }, 500);
  }
}

export function OPTIONS() { return preflight(); }
