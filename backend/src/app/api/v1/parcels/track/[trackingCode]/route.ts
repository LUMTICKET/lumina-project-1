import { fail, ok, preflight } from "@/lib/api-response";
import { trackParcel } from "@/modules/couriers/couriers.service";

export const dynamic = "force-dynamic";
interface Context { params: Promise<{ trackingCode: string }> }

export async function GET(_request: Request, context: Context) {
  const { trackingCode } = await context.params;
  try {
    const parcel = await trackParcel(trackingCode);
    return parcel ? ok(parcel) : fail({ code: "PARCEL_NOT_FOUND", message: "No parcel matches that tracking code." }, 404);
  } catch (error) {
    console.error(`Unable to track parcel ${trackingCode}`, error);
    return fail({ code: "TRACKING_UNAVAILABLE", message: "Parcel tracking is temporarily unavailable." }, 500);
  }
}

export function OPTIONS() { return preflight(); }
