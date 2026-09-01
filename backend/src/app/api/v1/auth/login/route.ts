import { loginSchema } from "@/contracts/auth";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { login } from "@/modules/auth/auth.service";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail({ code: "INVALID_JSON", message: "A JSON body is required." }, 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return validationFail(parsed.error.issues);

  try {
    const result = await login(parsed.data);
    if (!result) {
      return fail(
        { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." },
        401,
      );
    }
    return ok(result);
  } catch (error) {
    console.error("Unable to log in", error);
    return fail(
      { code: "LOGIN_UNAVAILABLE", message: "Login is temporarily unavailable." },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
