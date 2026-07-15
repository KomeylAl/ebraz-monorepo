import { AuthError, refresh as refreshService } from "@ebraz/auth/server";
import { parseCookieHeader } from "@ebraz/utils/cookie";
import { error } from "@/lib/http/response";
import { handleAuthError } from "../domain/auth.errors";
import { jsonWithCookie, setRefreshTokenCookie } from "../domain/auth.cookies";
import { withPublic } from "@/lib/http/with-auth";

export const POST = withPublic(async (request) => {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const refreshToken = cookies.refresh_token;

  if (!refreshToken) {
    return error("MISSING_REFRESH_TOKEN", "Refresh token is required", 401);
  }

  try {
    const result = await refreshService(refreshToken);
    return jsonWithCookie(
      {
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
      setRefreshTokenCookie(result.refreshToken),
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return error(err.code, err.message, 401);
    }
    return handleAuthError(err);
  }
});
