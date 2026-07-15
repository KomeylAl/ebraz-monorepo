import { verifyAccessToken } from "@ebraz/auth/server";
import type { AccessTokenPayload, Permission } from "@ebraz/types";
import type { NextRequest } from "next/server";
import { forbidden, unauthorized } from "./response";

export type AuthenticatedRequest = NextRequest & {
  auth: AccessTokenPayload;
};

type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) => Promise<Response>;

type AuthenticatedHandler = (
  request: AuthenticatedRequest,
  context: { params: Promise<Record<string, string>> },
) => Promise<Response>;

function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export function withAuth(handler: AuthenticatedHandler): RouteHandler {
  return async (request, context) => {
    const token = extractBearerToken(request);
    if (!token) return unauthorized();

    try {
      const payload = await verifyAccessToken(token);
      const authenticatedRequest = Object.assign(request, { auth: payload });
      return handler(authenticatedRequest as AuthenticatedRequest, context);
    } catch {
      return unauthorized("Invalid or expired token");
    }
  };
}

export function withPermission(
  permissions: Permission | Permission[],
  handler: AuthenticatedHandler,
): RouteHandler {
  return withAuth(async (request, context) => {
    const required = Array.isArray(permissions) ? permissions : [permissions];
    const hasAll = required.every((p) => request.auth.permissions.includes(p));

    if (!hasAll) return forbidden();

    return handler(request, context);
  });
}

export function withPublic(handler: RouteHandler): RouteHandler {
  return handler;
}

export function withTherapist(handler: AuthenticatedHandler): RouteHandler {
  return withAuth(async (request, context) => {
    if (request.auth.role !== "THERAPIST") {
      return forbidden("Therapist access only");
    }
    return handler(request, context);
  });
}
