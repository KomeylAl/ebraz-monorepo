import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useRestoreDoctors() {
  return useMutation({
    mutationKey: ["restoreDoctors"],
    mutationFn: async (data: any) => {
      const res = await fetch("/api/restore/doctors", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("خطا در بازگردانی");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: () => toast.success("بازگردانی انجام شد."),
  });
}

export function useRestoreClients() {
  return useMutation({
    mutationKey: ["restoreClients"],
    mutationFn: async () => {
      const res = await fetch("/api/restore/clients");
      if (!res.ok) throw new Error("خطا در بازگردانی");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: () => toast.success("بازگردانی انجام شد."),
  });
}

export function useRestoreAdmins() {
  return useMutation({
    mutationKey: ["restoreAdmins"],
    mutationFn: async () => {
      const res = await fetch("/api/restore/admins");
      if (!res.ok) throw new Error("خطا در بازگردانی");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: () => toast.success("بازگردانی انجام شد."),
  });
}

export function useRestoreDoctorResumes() {
  return useMutation({
    mutationKey: ["restoreDoctorResumes"],
    mutationFn: async () => {
      const res = await fetch("/api/restore/doctor-resumes");
      if (!res.ok) throw new Error("خطا در بازگردانی");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: () => toast.success("بازگردانی انجام شد."),
  });
}

export function useRestorePosts() {
  return useMutation({
    mutationKey: ["restorePosts"],
    mutationFn: async () => {
      const res = await fetch("/api/restore/posts");
      if (!res.ok) throw new Error("خطا در بازگردانی");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: () => toast.success("بازگردانی انجام شد."),
  });
}

export function useRestoreCategories() {
  return useMutation({
    mutationKey: ["restoreCategories"],
    mutationFn: async () => {
      const res = await fetch("/api/restore/categories");
      if (!res.ok) throw new Error("خطا در بازگردانی");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: () => toast.success("بازگردانی انجام شد."),
  });
}

export function useRestoreTags() {
  return useMutation({
    mutationKey: ["restoreTags"],
    mutationFn: async () => {
      const res = await fetch("/api/restore/tags");
      if (!res.ok) throw new Error("خطا در بازگردانی");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: () => toast.success("بازگردانی انجام شد."),
  });
}

export function useRestoreWorkshops() {
  return useMutation({
    mutationKey: ["restoreWorkshops"],
    mutationFn: async () => {
      const res = await fetch("/api/restore/workshops");
      if (!res.ok) throw new Error("خطا در بازگردانی");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: () => toast.success("بازگردانی انجام شد."),
  });
}

export function useRestoreAbout() {
  return useMutation({
    mutationKey: ["restoreAbout"],
    mutationFn: async (data: any) => {
      const res = await fetch("/api/restore/about", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("خطا در بازگردانی");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: () => toast.success("بازگردانی انجام شد."),
  });
}
