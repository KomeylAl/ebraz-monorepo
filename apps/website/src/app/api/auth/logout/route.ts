import { handleLogout } from "@ebraz/bff";

export async function POST() {
  return handleLogout();
}

export async function GET() {
  return handleLogout();
}
