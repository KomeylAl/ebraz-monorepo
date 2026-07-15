"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../auth/auth-context";

interface AuthGuardProps {
  loginPath: string;
  children: ReactNode;
}

export function AuthGuard({ loginPath, children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(loginPath);
    }
  }, [isAuthenticated, isLoading, loginPath, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        در حال بارگذاری...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
