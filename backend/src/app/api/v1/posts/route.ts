import { createPostSchema, postListQuerySchema } from "@/contracts/posts";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { authenticate } from "@/modules/auth/auth.service";
import { createPost, listPosts } from "@/modules/posts/posts.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = postListQuerySchema.safeParse(query);
  if (!parsed.success) return validationFail(parsed.error.issues);

  try {
    const auth = await authenticate(request);
    const result = await listPosts(parsed.data, auth?.user.id);
    return ok(result.items, undefined, { nextCursor: result.nextCursor });
  } catch (error) {
    console.error("Unable to list posts", error);
    return fail({ code: "POSTS_UNAVAILABLE", message: "Posts are temporarily unavailable." }, 500);
  }
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (!auth) {
    return fail({ code: "UNAUTHENTICATED", message: "Authentication is required." }, 401);
  }

  const parsed = createPostSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationFail(parsed.error.issues);

  try {
    const result = await createPost(parsed.data, auth.user.id);
    if (result.kind === "event_not_found") {
      return fail(
        { code: "EVENT_NOT_FOUND", message: "A published linked event was not found." },
        404,
      );
    }
    return ok(result.post, { status: 201 });
  } catch (error) {
    console.error("Unable to create post", error);
    return fail({ code: "POST_CREATE_FAILED", message: "The post could not be created." }, 500);
  }
}

export function OPTIONS() {
  return preflight();
}
