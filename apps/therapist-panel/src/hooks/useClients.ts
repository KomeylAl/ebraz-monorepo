import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useClients(page: number = 1, pageSize: number = 10, search: string = "") {
  return useQuery({
    queryKey: ["therapist-clients", page, pageSize, search],
    queryFn: async () => {
      const res = await fetch(
        `/api/clients?page=${page}&size=${pageSize}&search=${encodeURIComponent(search)}`,
      );
      if (!res.ok) {
        toast.error("خطا در دریافت مراجعین");
        throw new Error("خطا در دریافت مراجعین");
      }
      return res.json();
    },
    placeholderData: (prev) => prev,
  });
}

export function useClient(clientId: string) {
  return useQuery({
    queryKey: ["therapist-client", clientId],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${clientId}`);
      if (!res.ok) {
        toast.error("خطا در دریافت اطلاعات مراجع");
        throw new Error("خطا در دریافت اطلاعات مراجع");
      }
      const json = await res.json();
      return json.data ?? json;
    },
    enabled: Boolean(clientId),
  });
}

export function useClientRecord(clientId: string) {
  return useQuery({
    queryKey: ["therapist-client-record", clientId],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${clientId}/record`);
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        toast.error("خطا در دریافت پرونده پزشکی");
        throw new Error("خطا در دریافت پرونده پزشکی");
      }
      const json = await res.json();
      return json.data ?? json;
    },
    enabled: Boolean(clientId),
    retry: false,
  });
}
