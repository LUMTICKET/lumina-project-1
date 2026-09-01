import { venueListQuerySchema } from "@/contracts/venues";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { listVenues } from "@/modules/venues/venues.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = venueListQuerySchema.safeParse(query);

  if (!parsed.success) {
    return validationFail(parsed.error.issues);
  }

  try {
    const result = await listVenues(parsed.data);
    return ok(result.items, undefined, { nextCursor: result.nextCursor });
  } catch (error) {
    console.error("Unable to list venues", error);
    return fail(
      { code: "VENUES_UNAVAILABLE", message: "Venues are temporarily unavailable." },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
