import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useAppointmentsByDate(date: string = "") {
  return useQuery({
    queryKey: ["appointmentsByDate"],
    queryFn: async () => {
      const res = await fetch(`/api/appointments?date=${date}`);
      if (res.status !== 200) {
        toast.error("خطا در دریافت اطلاعات");
      }
      return res.json();
    },
  });
}

export function useAppointments(
  page: number = 0,
  pageSize: number = 10,
  search: string = "",
  date: string = "",
  clientId: string = ""
) {
  return useQuery({
    queryKey: ["appointments", page, pageSize, search, date, clientId],
    queryFn: async () => {
      const res = await fetch(
        `/api/appointments?page=${page}&size=${pageSize}&search=${search}&date=${date}&clientId=${clientId}`
      );
      if (res.status !== 200) {
        toast.error("خطا در دریافت اطلاعات");
      }
      return res.json();
    },
    placeholderData: (prev) => prev,
  });
}

export function useDeleteAppointment(
  appointmentId: number,
  onDeletedAppointment: () => void
) {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("مشکلی در حذف نوبت پیش آمده!");
      }
    },
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("نوبت با موفقت حذف شد");
      onDeletedAppointment();
    },
  });
}

export function useAddAppointment(onAddedAppointment: () => void) {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/appointments/`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("مشکلی در افزودن نوبت پیش آمده!");
      }
    },
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("نوبت با موفقت افزودن شد");
      onAddedAppointment();
    },
  });
}
