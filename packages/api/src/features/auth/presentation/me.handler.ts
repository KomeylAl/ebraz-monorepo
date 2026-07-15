import { AuthError, getMe } from "@ebraz/auth/server";
import { error, success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withAuth } from "@/lib/http/with-auth";

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = await getMe(request.auth);
    return success(user);
  } catch (err) {
    if (err instanceof AuthError) {
      return error(err.code, err.message, 401);
    }
    return error("INTERNAL_ERROR", "Something went wrong", 500);
  }
});
