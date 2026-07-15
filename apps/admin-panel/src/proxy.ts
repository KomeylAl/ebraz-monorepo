import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  // static resources => skip
  if (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // --- ROOT ---
  if (pathname === "/") {
    if (token) {
      let dashboard = "";
      switch (role) {
        case "admin":
          dashboard = "/admin-dashboard";
          break;
        case "author":
          dashboard = "/content-dashboard";
          break;
        case "accountant":
          dashboard = "/accountant-dashboard";
          break;
        default:
          dashboard = "/admin-dashboard";
      }
      return NextResponse.redirect(new URL(dashboard, request.url));
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // --- AUTH PAGE ---
  if (pathname.startsWith("/auth/login")) {
    if (token) {
      const dashboard =
        role === "author" ? "/content-dashboard" : "/admin-dashboard";
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
    return NextResponse.next();
  }

  // --- DASHBOARD PAGES ---
  if (pathname.startsWith("/admin-dashboard")) {
    if (!token)
      return NextResponse.redirect(new URL("/auth/login", request.url));
    if (role === "author")
      return NextResponse.redirect(new URL("/content-dashboard", request.url));
  }

  if (pathname.startsWith("/content-dashboard")) {
    if (!token)
      return NextResponse.redirect(new URL("/auth/login", request.url));
    if (role !== "author")
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
  }

  // --- DEFAULT ---
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin-dashboard/:path*",
    "/content-dashboard/:path*",
    "/auth/login",
  ],
};
