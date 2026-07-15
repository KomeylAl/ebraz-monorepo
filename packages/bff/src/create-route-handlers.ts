import { NextRequest } from "next/server";
import type { BffAppKind } from "./config";
import { handleLogin, handleLogout, handleToken, handleUser } from "./auth";
import { proxyBffRequest } from "./proxy";

type RouteContext = { params: Promise<{ path?: string[] }> };

export function createBffRouteHandlers(app: BffAppKind) {
  async function handler(request: NextRequest, context: RouteContext) {
    const { path = [] } = await context.params;
    return proxyBffRequest(request, { app, pathSegments: path });
  }

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    PATCH: handler,
    DELETE: handler,
  };
}

export function createAuthRouteHandlers(app: BffAppKind) {
  return {
    loginPOST: (request: NextRequest) => handleLogin(request, app),
    logoutPOST: () => handleLogout(),
    logoutGET: () => handleLogout(),
    tokenGET: (request: NextRequest) => handleToken(request),
    userGET: (request: NextRequest) => handleUser(request),
  };
}
