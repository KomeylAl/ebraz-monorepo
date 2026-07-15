import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useMyProfile() {
  return useQuery({
    queryKey: ["therapist-me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) {
        toast.error("خطا در دریافت اطلاعات پروفایل");
        throw new Error("خطا در دریافت اطلاعات پروفایل");
      }
      const json = await res.json();
      return json.data ?? json;
    },
  });
}

export function useUpdateProfile(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name?: string;
      phone?: string;
      email?: string | null;
      times?: string | null;
      days?: string | null;
    }) => {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "خطا در ذخیره تنظیمات");
      }
      return json.data ?? json;
    },
    onSuccess: (data) => {
      toast.success("تنظیمات با موفقیت ذخیره شد");
      queryClient.setQueryData(["therapist-me"], data);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطا در ذخیره تنظیمات");
    },
  });
}

export function useSendPasswordOtp() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/password/otp", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "خطا در ارسال کد تایید");
      }
      return json.data ?? json;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "کد تایید ارسال شد");
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطا در ارسال کد تایید");
    },
  });
}

export function useChangePassword(onSuccess?: () => void) {
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      password: string;
      confirmPassword: string;
    }) => {
      const res = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "خطا در تغییر رمز عبور");
      }
      return json.data ?? json;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "رمز عبور با موفقیت تغییر کرد");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطا در تغییر رمز عبور");
    },
  });
}
