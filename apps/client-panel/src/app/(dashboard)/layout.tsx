"use client";

import { AuthGuard, PanelShell } from "@ebraz/web";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard loginPath="/auth/login">
      <PanelShell title="پنل مراجع ابراز">{children}</PanelShell>
    </AuthGuard>
  );
}
