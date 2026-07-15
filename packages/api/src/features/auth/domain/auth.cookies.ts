import { REFRESH_TOKEN_TTL_SECONDS } from "@ebraz/config";
import { serializeCookie } from "@ebraz/utils/cookie";

export function setRefreshTokenCookie(refreshToken: string): string {
  return serializeCookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function clearRefreshTokenCookie(): string {
  return serializeCookie("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function jsonWithCookie(
  data: unknown,
  cookie: string,
  status = 200,
): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    },
  });
}
