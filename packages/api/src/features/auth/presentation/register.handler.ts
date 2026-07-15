import { registerClient } from "@ebraz/auth/server";
import { registerSchema, type RegisterInput } from "@ebraz/validation";
import { handleAuthError } from "../domain/auth.errors";
import { jsonWithCookie, setRefreshTokenCookie } from "../domain/auth.cookies";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { withPublic } from "@/lib/http/with-auth";

export const POST = withPublic(async (request) => {
  const input = await parseBody<RegisterInput>(request, registerSchema);
  if (isErrorResponse(input)) return input;

  try {
    const result = await registerClient(input);
    return jsonWithCookie(
      {
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
      },
      setRefreshTokenCookie(result.tokens.refreshToken),
      201,
    );
  } catch (err) {
    return handleAuthError(err);
  }
});
