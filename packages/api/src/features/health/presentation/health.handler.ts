import { success } from "@/lib/http/response";
import { withPublic } from "@/lib/http/with-auth";
import { healthService } from "../application/health.service";

export const GET = withPublic(async () => {
  return success(healthService.check());
});
