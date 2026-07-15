import { createPanelMiddleware } from "@ebraz/web/middleware";

export const middleware = createPanelMiddleware();

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
