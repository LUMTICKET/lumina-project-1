export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export interface ApiFailure {
  error: ApiErrorDetail;
}

interface ValidationIssue {
  message: string;
  path: PropertyKey[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.EXPO_APP_ORIGIN ?? "http://localhost:8081",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  Vary: "Origin",
};

function withCors(init?: ResponseInit): ResponseInit {
  return {
    ...init,
    headers: {
      ...corsHeaders,
      ...Object.fromEntries(new Headers(init?.headers).entries()),
    },
  };
}

export function ok<T>(
  data: T,
  init?: ResponseInit,
  meta?: Record<string, unknown>,
) {
  const body: ApiSuccess<T> = meta ? { data, meta } : { data };

  return Response.json(body, withCors(init));
}

export function fail(error: ApiErrorDetail, status: number) {
  const body: ApiFailure = { error };

  return Response.json(body, withCors({ status }));
}

export function preflight() {
  return new Response(null, withCors({ status: 204 }));
}

export function validationFail(issues: readonly ValidationIssue[]) {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of issues) {
    const field = issue.path.map(String).join(".") || "query";
    fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
  }

  return fail(
    {
      code: "VALIDATION_ERROR",
      message: "The request contains invalid values.",
      fieldErrors,
    },
    400,
  );
}
