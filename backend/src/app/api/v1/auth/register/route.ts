import { registerSchema } from "@/contracts/auth";
import { fail, ok, preflight, validationFail } from "@/lib/api-response";
import { register } from "@/modules/auth/auth.service";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail({ code: "INVALID_JSON", message: "A JSON body is required." }, 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return validationFail(parsed.error.issues);

  try {
    const result = await register(parsed.data);
    if (result.kind === "email_in_use") {
      return fail(
        { code: "EMAIL_IN_USE", message: "An account already uses this email." },
        409,
      );
    }
    return ok(result, { status: 201 });
  } catch (error) {
    console.error("Unable to register account", error);
    return fail(
      { code: "REGISTRATION_UNAVAILABLE", message: "Registration is temporarily unavailable." },
      500,
    );
  }
}

export function OPTIONS() {
  return preflight();
}
