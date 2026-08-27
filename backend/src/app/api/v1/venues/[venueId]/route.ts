import { fail, ok, preflight } from "@/lib/api-response";
import { getVenueById } from "@/modules/venues/venues.service";

export const dynamic = "force-dynamic";

interface VenueRouteContext {
  params: Promise<{ venueId: string }>;
}

export async function GET(_request: Request, context: VenueRouteContext) {
  const { venueId } = await context.params;

  try {
    const venue = await getVenueById(venueId);

    if (!venue) {
      return fail({ code: "VENUE_NOT_FOUND", message: "Venue not found." }, 404);
    }

    return ok(venue);
  } catch (error) {
    console.error(`Unable to load venue ${venueId}`, error);
    return fail(
      { code: "VENUE_UNAVAILABLE", message: "The venue is temporarily unavailable." },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
