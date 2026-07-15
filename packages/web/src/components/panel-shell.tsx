"use client";

import { Button } from "@ebraz/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/auth-context";

interface NavItem {
  href: string;
  label: string;
}

interface PanelShellProps {
  title: string;
  navItems?: NavItem[];
  children: React.ReactNode;
}

export function PanelShell({ title, navItems = [], children }: PanelShellProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/auth/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {user ? (
              <p className="text-sm text-zinc-500">
                {user.name} — {user.phone}
              </p>
            ) : null}
          </div>
          <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
            خروج
          </Button>
        </div>
      </header>

      {navItems.length > 0 ? (
        <nav className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}

      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
