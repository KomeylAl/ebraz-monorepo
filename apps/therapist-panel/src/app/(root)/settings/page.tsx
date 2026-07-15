"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PuffLoader } from "react-spinners";
import Header from "@/components/layout/Header";
import ErrorComponent from "@/components/layout/ErrorComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/contexts/UserContext";
import {
  useChangePassword,
  useMyProfile,
  useSendPasswordOtp,
  useUpdateProfile,
} from "@/hooks/useSettings";
import { dateConvert } from "@/lib/utils";

type ProfileForm = {
  name: string;
  email: string;
  times: string;
  days: string;
};

type PhoneForm = {
  phone: string;
};

type PasswordForm = {
  code: string;
  password: string;
  confirmPassword: string;
};

export default function SettingsPage() {
  const { user, setUser } = useUser();
  const { data: profile, isLoading, error, refetch } = useMyProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile((updated) => {
    if (user && updated) {
      setUser({
        ...user,
        name: updated.name ?? user.name,
        phone: updated.phone ?? user.phone,
      });
    }
  });
  const {
    mutate: sendOtp,
    isPending: isSendingOtp,
    data: otpMeta,
    isSuccess: otpSent,
    reset: resetOtp,
  } = useSendPasswordOtp();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword(() => {
    passwordForm.reset();
    resetOtp();
    setCooldown(0);
  });

  const [cooldown, setCooldown] = useState(0);

  const profileForm = useForm<ProfileForm>();
  const phoneForm = useForm<PhoneForm>();
  const passwordForm = useForm<PasswordForm>();

  useEffect(() => {
    if (!profile) return;
    profileForm.reset({
      name: profile.name ?? "",
      email: profile.email ?? "",
      times: profile.times ?? "",
      days: profile.days ?? "",
    });
    phoneForm.reset({
      phone: profile.phone ?? "",
    });
  }, [profile, profileForm, phoneForm]);

  useEffect(() => {
    if (otpSent) {
      setCooldown(60);
    }
  }, [otpSent]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSaveProfile = (values: ProfileForm) => {
    updateProfile({
      name: values.name.trim(),
      email: values.email.trim() ? values.email.trim() : null,
      times: values.times.trim() || null,
      days: values.days.trim() || null,
    });
  };

  const onSavePhone = (values: PhoneForm) => {
    updateProfile({ phone: values.phone.trim() });
  };

  const onChangePassword = (values: PasswordForm) => {
    if (values.password !== values.confirmPassword) {
      passwordForm.setError("confirmPassword", {
        message: "رمز عبور و تکرار آن یکسان نیستند",
      });
      return;
    }
    changePassword({
      code: values.code.trim(),
      password: values.password,
      confirmPassword: values.confirmPassword,
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Header searchFn={() => {}} isShowSearch={false} />
      <div className="w-full flex flex-col p-8 md:p-12 gap-6">
        <h2 className="font-bold text-2xl">تنظیمات</h2>

        {isLoading && (
          <div className="w-full h-64 flex items-center justify-center">
            <PuffLoader size={60} color="#3e86fa" />
          </div>
        )}

        {error && <ErrorComponent refetch={refetch} />}

        {profile && (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="gap-2">
              <TabsTrigger value="profile">پروفایل</TabsTrigger>
              <TabsTrigger value="phone">شماره موبایل</TabsTrigger>
              <TabsTrigger value="password">تغییر رمز عبور</TabsTrigger>
              <TabsTrigger value="info">اطلاعات ثابت</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <form
                onSubmit={profileForm.handleSubmit(onSaveProfile)}
                className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6"
              >
                <h3 className="font-semibold text-lg">اطلاعات عمومی</h3>
                <div className="space-y-2">
                  <Label htmlFor="name">نام و نام خانوادگی</Label>
                  <Input id="name" className="bg-white" {...profileForm.register("name", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input id="email" type="email" className="bg-white" {...profileForm.register("email")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days">روزهای حضور</Label>
                  <Input
                    id="days"
                    placeholder="مثلاً شنبه تا چهارشنبه"
                    className="bg-white"
                    {...profileForm.register("days")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="times">ساعات کاری</Label>
                  <Input
                    id="times"
                    placeholder="مثلاً ۹ تا ۱۷"
                    className="bg-white"
                    {...profileForm.register("times")}
                  />
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="mt-6">
              <form
                onSubmit={phoneForm.handleSubmit(onSavePhone)}
                className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6"
              >
                <h3 className="font-semibold text-lg">تغییر شماره موبایل</h3>
                <p className="text-sm text-slate-600">
                  می‌توانید شماره موبایل خود را بدون نیاز به کد تایید تغییر دهید. این شماره برای
                  ورود و دریافت پیامک‌ها استفاده می‌شود.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="phone">شماره موبایل</Label>
                  <Input
                    id="phone"
                    className="bg-white"
                    {...phoneForm.register("phone", { required: true })}
                  />
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "در حال ذخیره..." : "ذخیره شماره"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="password" className="mt-6">
              <div className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-lg">تغییر رمز عبور</h3>
                <p className="text-sm text-slate-600">
                  برای امنیت بیشتر، ابتدا کد تایید پیامکی به شماره فعلی شما ارسال می‌شود و سپس
                  می‌توانید رمز جدید را تنظیم کنید.
                </p>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSendingOtp || cooldown > 0}
                    onClick={() => sendOtp()}
                  >
                    {isSendingOtp
                      ? "در حال ارسال..."
                      : cooldown > 0
                        ? `ارسال مجدد (${cooldown})`
                        : otpSent
                          ? "ارسال مجدد کد"
                          : "ارسال کد تایید"}
                  </Button>
                  {(otpMeta?.masked_phone || otpMeta?.maskedPhone) && (
                    <span className="text-sm text-slate-500">
                      ارسال به {otpMeta.masked_phone ?? otpMeta.maskedPhone}
                    </span>
                  )}
                </div>

                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">کد تایید ۶ رقمی</Label>
                    <Input
                      id="code"
                      inputMode="numeric"
                      maxLength={6}
                      className="bg-white tracking-widest"
                      {...passwordForm.register("code", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">رمز عبور جدید</Label>
                    <Input
                      id="password"
                      type="password"
                      className="bg-white"
                      {...passwordForm.register("password", {
                        required: true,
                        minLength: 8,
                      })}
                    />
                    <p className="text-xs text-slate-500">حداقل ۸ کاراکتر</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="bg-white"
                      {...passwordForm.register("confirmPassword", { required: true })}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-rose-500">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "در حال ذخیره..." : "تغییر رمز عبور"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="info" className="mt-6">
              <div className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-lg">اطلاعات ثابت حساب</h3>
                <p className="text-sm text-slate-600">
                  این اطلاعات از طریق پنل مدیریت ثبت شده‌اند و از اینجا قابل ویرایش نیستند.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">کد ملی</p>
                    <p className="font-medium mt-1">{profile.national_code ?? profile.nationalCode}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">شماره نظام / پزشکی</p>
                    <p className="font-medium mt-1">
                      {profile.medical_number ?? profile.medicalNumber ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">شماره کارت</p>
                    <p className="font-medium mt-1">{profile.card_number ?? profile.cardNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">تاریخ تولد</p>
                    <p className="font-medium mt-1">
                      {profile.birth_date || profile.birthDate
                        ? dateConvert(profile.birth_date ?? profile.birthDate)
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
