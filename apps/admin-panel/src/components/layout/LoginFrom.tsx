"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import imagePlaceholder from "../../../public/images/login_placeholder.jpg";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLogin } from "@/hooks/useAuth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const router = useRouter();
  const { mutate: login, isPending } = useLogin(() => {
    router.push("/");
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.password) {
      toast.error("لطفا همه فیلد ها را پر کنید");
    } else {
      login(formData);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">خوش برگشتین</h1>
                <p className="text-muted-foreground text-balance">
                  ورود به پنل مدیریت کلینیک ابراز
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="phone">شماره تلفن</FieldLabel>
                <Input
                  id="phone"
                  type="number"
                  placeholder="مثلا: 09123456789"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">رمز عبور</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
                <div className="flex items-center">
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    رمز عبور خود را فراموش کرده اید؟
                  </a>
                </div>
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  ورود
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                یا
              </FieldSeparator>
              <Field>
                <Button variant="ghost">بازگشت به سایت</Button>
              </Field>
              <FieldDescription className="text-center">
                در صورت بروز مشکل در ورود به مدیر سایت اطلاع دهید.
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src={imagePlaceholder}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
