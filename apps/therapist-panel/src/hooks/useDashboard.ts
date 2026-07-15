import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useDashboard() {
  return useQuery({
    queryKey: ["therapist-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        toast.error("خطا در دریافت اطلاعات داشبورد");
        throw new Error("خطا در دریافت اطلاعات داشبورد");
      }
      return res.json();
    },
  });
}
