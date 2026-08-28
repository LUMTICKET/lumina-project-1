import { reportPostSchema } from "@/contracts/posts";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { reportPost } from "@/modules/posts/posts.service";

interface ReportRouteContext {
  params: Promise<{ postId: string }>;
}

export async function POST(request: Request, context: ReportRouteContext) {
  const auth = await authenticate(request);
  if (!auth) {
    return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  }
  const parsed = reportPostSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationFail(parsed.error.issues);

  const { postId } = await context.params;
  try {
    const result = await reportPost(postId, auth.user.id, parsed.data);
    if (result.kind === "not_found") {
      return fail({ code: "POST_NOT_FOUND", message: "Post not found." }, 404);
    }
    if (result.kind === "own_post") {
      return fail({ code: "OWN_POST_REPORT", message: "You cannot report your own post." }, 409);
    }
    return ok({ reported: true });
  } catch (error) {
    console.error(`Unable to report post ${postId}`, error);
    return fail({ code: "REPORT_FAILED", message: "The report could not be submitted." }, 500);
  }
}

export function OPTIONS() {
  return preflight();
}
