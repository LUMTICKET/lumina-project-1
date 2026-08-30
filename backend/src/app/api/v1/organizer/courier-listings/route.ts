import { fail, ok, preflight } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { listOrganizerCourierListings } from "@/modules/couriers/couriers.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (!auth) {
    return fail(
      { code: "UNAUTHENTICATED", message: "Authentication is required." },
      401,
    );
  }
  if (auth.user.role !== "organizer" || !auth.user.organizer) {
    return fail(
      {
        code: "ORGANIZER_REQUIRED",
        message: "An organizer account is required.",
      },
      403,
    );
  }

  try {
    return ok(await listOrganizerCourierListings(auth.user.organizer.id));
  } catch (error) {
    console.error("Unable to list organizer courier services", error);
    return fail(
      {
        code: "COURIERS_UNAVAILABLE",
        message: "Courier services are temporarily unavailable.",
      },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
