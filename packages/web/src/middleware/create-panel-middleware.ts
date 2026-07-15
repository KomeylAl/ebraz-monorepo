import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function createPanelMiddleware(publicPaths: string[] = ["/auth/login"]) {
  return function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return NextResponse.next();
    }

    const hasAuth = request.cookies.get("ebraz_auth");
    if (!hasAuth) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  };
}

export const panelMiddlewareConfig = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
