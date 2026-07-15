"use client";

import { LoginForm, useAuth } from "@ebraz/web";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(searchParams.get("from") ?? "/");
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <LoginForm title="ورود مراجع" description="پنل مراجع کلینیک ابراز" />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-zinc-500">
          در حال بارگذاری...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
