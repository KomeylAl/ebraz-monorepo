import { handleToken } from "@ebraz/bff";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return handleToken(request);
}
