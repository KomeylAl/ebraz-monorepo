import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useBackupDoctors() {
  return useMutation({
    mutationKey: ["backupDoctors"],
    mutationFn: async () => {
      const res = await fetch("/api/backup/doctors");
      if (!res.ok) throw new Error("خطا در تهیه کپی پشتیبان");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "doctors_backup.json";
      link.click();
      toast.success("پشتیبان گیری انجام شد.");
    },
  });
}

export function useBackupClients() {
  return useMutation({
    mutationKey: ["backupClients"],
    mutationFn: async () => {
      const res = await fetch("/api/backup/clients");
      if (!res.ok) throw new Error("خطا در تهیه کپی پشتیبان");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "clients_backup.json";
      link.click();
      toast.success("پشتیبان گیری انجام شد.");
    },
  });
}

export function useBackupAdmins() {
  return useMutation({
    mutationKey: ["backupAdmins"],
    mutationFn: async () => {
      const res = await fetch("/api/backup/admins");
      if (!res.ok) throw new Error("خطا در تهیه کپی پشتیبان");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "admins_backup.json";
      link.click();
      toast.success("پشتیبان گیری انجام شد.");
    },
  });
}

export function useBackupDoctorResumes() {
  return useMutation({
    mutationKey: ["backupDoctorResumes"],
    mutationFn: async () => {
      const res = await fetch("/api/backup/doctor-resumes");
      if (!res.ok) throw new Error("خطا در تهیه کپی پشتیبان");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "doctor_resumes_backup.json";
      link.click();
      toast.success("پشتیبان گیری انجام شد.");
    },
  });
}

export function useBackupPosts() {
  return useMutation({
    mutationKey: ["backupPosts"],
    mutationFn: async () => {
      const res = await fetch("/api/backup/posts");
      if (!res.ok) throw new Error("خطا در تهیه کپی پشتیبان");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "posts_backup.json";
      link.click();
      toast.success("پشتیبان گیری انجام شد.");
    },
  });
}

export function useBackupCategoties() {
  return useMutation({
    mutationKey: ["backupCategories"],
    mutationFn: async () => {
      const res = await fetch("/api/backup/categories");
      if (!res.ok) throw new Error("خطا در تهیه کپی پشتیبان");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "categories_backup.json";
      link.click();
      toast.success("پشتیبان گیری انجام شد.");
    },
  });
}

export function useBackupTags() {
  return useMutation({
    mutationKey: ["backupTags"],
    mutationFn: async () => {
      const res = await fetch("/api/backup/tags");
      if (!res.ok) throw new Error("خطا در تهیه کپی پشتیبان");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "tags_backup.json";
      link.click();
      toast.success("پشتیبان گیری انجام شد.");
    },
  });
}

export function useBackupWorkshops() {
  return useMutation({
    mutationKey: ["backupWorkshops"],
    mutationFn: async () => {
      const res = await fetch("/api/backup/workshops");
      if (!res.ok) throw new Error("خطا در تهیه کپی پشتیبان");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "workshops_backup.json";
      link.click();
      toast.success("پشتیبان گیری انجام شد.");
    },
  });
}

export function useBackupAbout() {
  return useMutation({
    mutationKey: ["backupAbout"],
    mutationFn: async () => {
      const res = await fetch("/api/backup/about");
      if (!res.ok) throw new Error("خطا در تهیه کپی پشتیبان");
      return res.json();
    },
    onError: (error) => toast.error(`${error.message}`),
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "about_backup.json";
      link.click();
      toast.success("پشتیبان گیری انجام شد.");
    },
  });
}
