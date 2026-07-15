"use client";

import type { AuthRole } from "@ebraz/api-client";
import { AppProviders, AuthProvider } from "@ebraz/web";
import type { ReactNode } from "react";
import { api } from "@/lib/api";

export function AppShell({ role, children }: { role: AuthRole; children: ReactNode }) {
  return (
    <AppProviders>
      <AuthProvider api={api} role={role} loginPath="/auth/login">
        {children}
      </AuthProvider>
    </AppProviders>
  );
}
