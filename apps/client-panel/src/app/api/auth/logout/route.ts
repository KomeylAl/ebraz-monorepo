import { handleLogout } from "@ebraz/bff";

export async function POST() {
  return handleLogout();
}
