import { ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok({
    service: "lumina-api",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
