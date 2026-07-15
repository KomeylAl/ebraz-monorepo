import { login as loginService } from "@ebraz/auth/server";
import type { DbUserRole } from "@ebraz/types";
import { loginSchema, type LoginInput } from "@ebraz/validation";
import { handleAuthError } from "../domain/auth.errors";
import { jsonWithCookie, setRefreshTokenCookie } from "../domain/auth.cookies";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { withPublic } from "@/lib/http/with-auth";

export function createLoginHandler(role: DbUserRole) {
  return withPublic(async (request) => {
    const input = await parseBody<LoginInput>(request, loginSchema);
    if (isErrorResponse(input)) return input;

    try {
      const result = await loginService(input, role);
      return jsonWithCookie(
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
        setRefreshTokenCookie(result.tokens.refreshToken),
      );
    } catch (err) {
      return handleAuthError(err);
    }
  });
}

export const adminLoginHandler = createLoginHandler("ADMIN");
export const therapistLoginHandler = createLoginHandler("THERAPIST");
export const clientLoginHandler = createLoginHandler("CLIENT");
