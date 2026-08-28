import { fail, ok, preflight } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { getPost } from "@/modules/posts/posts.service";

interface PostRouteContext {
  params: Promise<{ postId: string }>;
}

export async function GET(request: Request, context: PostRouteContext) {
  const { postId } = await context.params;
  try {
    const auth = await authenticate(request);
    const post = await getPost(postId, auth?.user.id);
    if (!post) {
      return fail({ code: "POST_NOT_FOUND", message: "Post not found." }, 404);
    }
    return ok(post);
  } catch (error) {
    console.error(`Unable to load post ${postId}`, error);
    return fail({ code: "POST_UNAVAILABLE", message: "The post is temporarily unavailable." }, 500);
  }
}

export function OPTIONS() {
  return preflight();
}
