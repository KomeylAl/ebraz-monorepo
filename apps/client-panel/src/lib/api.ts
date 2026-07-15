import { createApiClient } from "@ebraz/api-client";
import { clientEnv } from "./env";

export const api = createApiClient(clientEnv.NEXT_PUBLIC_API_URL);
