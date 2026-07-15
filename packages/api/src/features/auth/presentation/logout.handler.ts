import { logout as logoutService } from "@ebraz/auth/server";
import { parseCookieHeader } from "@ebraz/utils/cookie";
import { success } from "@/lib/http/response";
import { clearRefreshTokenCookie } from "../domain/auth.cookies";
import { withPublic } from "@/lib/http/with-auth";

export const POST = withPublic(async (request) => {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const refreshToken = cookies.refresh_token;

  if (refreshToken) {
    await logoutService(refreshToken);
  }

  return new Response(JSON.stringify({ success: true, data: { message: "Logged out" } }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearRefreshTokenCookie(),
    },
  });
});
