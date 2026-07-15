import {
  upsertAboutSchema,
  type UpsertAboutInput,
} from "@ebraz/validation/cms/about";
import { handleCmsError } from "@/features/cms/domain/cms-error.handler";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { success } from "@/lib/http/response";
import type { AuthenticatedRequest } from "@/lib/http/with-auth";
import { withPermission, withPublic } from "@/lib/http/with-auth";
import { getAbout, upsertAbout } from "../application/about.service";

export const getAboutHandler = withPermission("cms.read", async () => {
  try {
    return success(await getAbout());
  } catch (err) {
    return handleCmsError(err);
  }
});

export const getPublicAboutHandler = withPublic(async () => {
  try {
    return success(await getAbout());
  } catch (err) {
    return handleCmsError(err);
  }
});

export const upsertAboutHandler = withPermission(
  "cms.write",
  async (request: AuthenticatedRequest) => {
    const input = await parseBody<UpsertAboutInput>(request, upsertAboutSchema);
    if (isErrorResponse(input)) return input;
    try {
      return success(await upsertAbout(input, request.auth.sub));
    } catch (err) {
      return handleCmsError(err);
    }
  },
);
