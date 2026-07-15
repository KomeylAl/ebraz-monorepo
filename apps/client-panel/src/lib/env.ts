import { parseClientEnv } from "@ebraz/config";

export const clientEnv = parseClientEnv({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
});
