import { moderatePostSchema } from "@/contracts/posts";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { moderateReportedPost } from "@/modules/posts/posts.service";

interface PostModerationRouteContext {
  params: Promise<{ postId: string }>;
}

export async function POST(request: Request, context: PostModerationRouteContext) {
  const auth = await authenticate(request);
  if (!auth) {
    return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  }
  if (auth.user.role !== "admin") {
    return fail({ code: "ADMIN_REQUIRED", message: "Administrator access is required." }, 403);
  }
  const parsed = moderatePostSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationFail(parsed.error.issues);

  const { postId } = await context.params;
  try {
    const result = await moderateReportedPost(postId, auth.user.id, parsed.data);
    if (result.kind === "not_reported") {
      return fail(
        { code: "POST_NOT_REPORTED", message: "This post has no open reports." },
        409,
      );
    }
    return ok({ decision: result.decision });
  } catch (error) {
    console.error(`Unable to moderate post ${postId}`, error);
    return fail(
      { code: "POST_MODERATION_FAILED", message: "The moderation decision could not be saved." },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
