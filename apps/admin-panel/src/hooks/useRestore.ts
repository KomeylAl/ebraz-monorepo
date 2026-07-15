import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

async function restoreEntity(path: string, data: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let message = "خطا در بازگردانی";
    try {
      const json = (await res.json()) as {
        error?: { message?: string };
        message?: string;
      };
      message = json.error?.message ?? json.message ?? message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }
  return res.json();
}

function createRestoreHook(path: string, mutationKey: string) {
  return function useRestore() {
    return useMutation({
      mutationKey: [mutationKey],
      mutationFn: (data: unknown) => restoreEntity(path, data),
      onError: (error) => toast.error(`${error.message}`),
      onSuccess: () => toast.success("بازگردانی انجام شد."),
    });
  };
}

export const useRestoreDoctors = createRestoreHook(
  "/api/restore/doctors",
  "restoreDoctors"
);
export const useRestoreClients = createRestoreHook(
  "/api/restore/clients",
  "restoreClients"
);
export const useRestoreAdmins = createRestoreHook(
  "/api/restore/admins",
  "restoreAdmins"
);
export const useRestoreDoctorResumes = createRestoreHook(
  "/api/restore/doctor-resumes",
  "restoreDoctorResumes"
);
export const useRestorePosts = createRestoreHook(
  "/api/restore/posts",
  "restorePosts"
);
export const useRestoreCategories = createRestoreHook(
  "/api/restore/categories",
  "restoreCategories"
);
export const useRestoreTags = createRestoreHook(
  "/api/restore/tags",
  "restoreTags"
);
export const useRestoreWorkshops = createRestoreHook(
  "/api/restore/workshops",
  "restoreWorkshops"
);
export const useRestoreAbout = createRestoreHook(
  "/api/restore/about",
  "restoreAbout"
);
