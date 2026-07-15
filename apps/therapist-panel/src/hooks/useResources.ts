import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useResources(
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
) {
  return useQuery({
    queryKey: ["resources", page, pageSize, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/resources?${params.toString()}`);
      if (!res.ok) {
        toast.error("خطا در دریافت اطلاعات");
        throw new Error("خطا در دریافت منابع");
      }
      return res.json();
    },
    placeholderData: (prev) => prev,
  });
}

export function useCreateResource(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/resources", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "خطا در ایجاد منبع");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("منبع با موفقیت افزوده شد");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطا در ایجاد منبع");
    },
  });
}

export function useUpdateResource(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PATCH",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "خطا در ویرایش منبع");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("منبع با موفقیت ویرایش شد");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطا در ویرایش منبع");
    },
  });
}

export function useDeleteResource(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || "خطا در حذف منبع");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("منبع حذف شد");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطا در حذف منبع");
    },
  });
}
