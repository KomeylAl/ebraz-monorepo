import { handleLogin } from "@ebraz/bff";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return handleLogin(request, "client");
}
