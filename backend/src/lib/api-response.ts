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

export function ok<T>(
  data: T,
  init?: ResponseInit,
  meta?: Record<string, unknown>,
) {
  const body: ApiSuccess<T> = meta ? { data, meta } : { data };

  return Response.json(body, init);
}

export function fail(error: ApiErrorDetail, status: number) {
  const body: ApiFailure = { error };

  return Response.json(body, { status });
}
