import { fail, ok, preflight } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { listReportedPosts } from "@/modules/posts/posts.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (!auth) {
    return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  }
  if (auth.user.role !== "admin") {
    return fail({ code: "ADMIN_REQUIRED", message: "Administrator access is required." }, 403);
  }

  try {
    return ok(await listReportedPosts());
  } catch (error) {
    console.error("Unable to list reported posts", error);
    return fail(
      { code: "POST_MODERATION_UNAVAILABLE", message: "Reported posts are unavailable." },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
