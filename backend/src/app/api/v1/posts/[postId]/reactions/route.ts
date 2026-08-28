import { fail, ok, preflight } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { addPostLike, removePostLike } from "@/modules/posts/posts.service";

interface ReactionRouteContext {
  params: Promise<{ postId: string }>;
}

async function requireUser(request: Request) {
  return authenticate(request);
}

export async function POST(request: Request, context: ReactionRouteContext) {
  const auth = await requireUser(request);
  if (!auth) {
    return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  }
  const { postId } = await context.params;
  try {
    const post = await addPostLike(postId, auth.user.id);
    return post
      ? ok(post)
      : fail({ code: "POST_NOT_FOUND", message: "Post not found." }, 404);
  } catch (error) {
    console.error(`Unable to react to post ${postId}`, error);
    return fail({ code: "REACTION_FAILED", message: "The reaction could not be saved." }, 500);
  }
}

export async function DELETE(request: Request, context: ReactionRouteContext) {
  const auth = await requireUser(request);
  if (!auth) {
    return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  }
  const { postId } = await context.params;
  try {
    const post = await removePostLike(postId, auth.user.id);
    return post
      ? ok(post)
      : fail({ code: "POST_NOT_FOUND", message: "Post not found." }, 404);
  } catch (error) {
    console.error(`Unable to remove reaction from post ${postId}`, error);
    return fail({ code: "REACTION_FAILED", message: "The reaction could not be removed." }, 500);
  }
}

export function OPTIONS() {
  return preflight();
}
