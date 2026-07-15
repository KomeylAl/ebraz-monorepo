import type { ApiErrorResponse, ApiSuccessResponse } from "@ebraz/types";

export function success<T>(data: T, status = 200): Response {
  const body: ApiSuccessResponse<T> = { success: true, data };
  return Response.json(body, { status });
}

export function error(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, string[]>,
): Response {
  const body: ApiErrorResponse = {
    success: false,
    error: { code, message, details },
  };
  return Response.json(body, { status });
}

export function unauthorized(message = "Unauthorized"): Response {
  return error("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "Forbidden"): Response {
  return error("FORBIDDEN", message, 403);
}

export function notFound(message = "Not found"): Response {
  return error("NOT_FOUND", message, 404);
}

export function serverError(message = "Internal server error"): Response {
  return error("INTERNAL_ERROR", message, 500);
}
