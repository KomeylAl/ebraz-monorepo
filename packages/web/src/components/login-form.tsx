"use client";

import { ApiError } from "@ebraz/api-client";
import { Button, Card, CardContent, Input, Label, cn } from "@ebraz/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../auth/auth-context";

interface LoginFormProps {
  title: string;
  description: string;
  className?: string;
}

export function LoginForm({ title, description, className }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!phone || !password) {
      setError("لطفاً همه فیلدها را پر کنید");
      return;
    }

    setIsPending(true);
    try {
      await login({ phone, password });
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("خطا در ورود. دوباره تلاش کنید.");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      <Card>
        <CardContent className="p-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-sm text-zinc-500">{description}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">شماره تلفن</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="مثلاً 09123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "در حال ورود..." : "ورود"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
