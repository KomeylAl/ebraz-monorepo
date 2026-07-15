import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useAppointments(
  page: number = 0,
  pageSize: number = 10,
  search: string = "",
  date: string = "",
) {
  return useQuery({
    queryKey: ["appointments", page, pageSize, search, date],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
      });
      if (search.trim()) params.set("search", search.trim());
      if (date.trim()) params.set("date", date.trim());

      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (res.status !== 200) {
        toast.error("خطا در دریافت اطلاعات");
      }
      return res.json();
    },
    placeholderData: (prev) => prev,
  });
}
