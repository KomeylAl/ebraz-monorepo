import Link from "next/link";
import {
  convertNotifPriority,
  convertNotifStatus,
  convertNotifType,
  dateConvert,
} from "./utils";
import { PuffLoader } from "react-spinners";
import { ChartBar, Check } from "lucide-react";

export const appointmentColumns = [
  {
    header: "مراجع",
    accessor: (row: any) => (
      <div className="relative inline-block">{row.client?.name}</div>
    ),
    cellClassName: (row: any) => "text-violet-500",
  },
  {
    header: "مشاور",
    accessor: (row: any) => (
      <div className="relative inline-block">
        {row.doctor?.name ?? row.therapist?.name}
      </div>
    ),
    cellClassName: (row: any) => "text-cyan-500",
  },
  {
    header: "تاریخ و ساعت",
    accessor: (row: any) => row.time + " - " + dateConvert(row.date),
  },
  {
    header: "وضعیت",
    accessor: (row: any) =>
      row.status === "done" ? "انجام شده" : "انجام نشده",
    cellClassName: (row: any) =>
      row.status === "done" ? "text-blue-600" : "text-amber-500",
  },
  {
    header: "پرداخت",
    accessor: (row: any) => row.amount ?? "ندارد",
    cellClassName: (row: any) =>
      row.payment_status === "paid" ? "text-indigo-500" : "text-rose-500",
  },
];

export const AllNotificationsColumns = [
  {
    header: "عنوان",
    accessor: (row: any) => <p className="peer">{row.title}</p>,
    cellClassName: (row: any) => "text-violet-500",
  },
  {
    header: "اولویت",
    accessor: (row: any) => convertNotifPriority(row.priority),
    cellClassName: (row: any) =>
      `${
        row.priority === "high"
          ? "text-rose-500"
          : row.priority === "medium"
          ? "text-amber-500"
          : "text-cyan-500"
      }`,
  },
  { header: "وضعیت", accessor: (row: any) => convertNotifStatus(row.status) },
  {
    header: "نوع",
    accessor: (row: any) => convertNotifType(row.type),
  },
  {
    header: "زمان",
    accessor: (row: any) => dateConvert(row.created_at),
  },
];

export const unreadNotificationColumns = (
  isPending: boolean = false,
  loadingId: string | null = null,
  mutationFn: (notifId: string) => void
) => [
  {
    header: "عنوان",
    accessor: (row: any) => <p className="peer">{row.title}</p>,
    cellClassName: (row: any) => "text-violet-500",
  },
  {
    header: "اولویت",
    accessor: (row: any) => convertNotifPriority(row.priority),
    cellClassName: (row: any) =>
      `${
        row.priority === "high"
          ? "text-rose-500"
          : row.priority === "medium"
          ? "text-amber-500"
          : "text-cyan-500"
      }`,
  },
  { header: "وضعیت", accessor: (row: any) => convertNotifStatus(row.status) },
  { header: "نوع", accessor: (row: any) => convertNotifType(row.type) },
  {
    header: "علامت گذاری به عنوان خوانده شده",
    accessor: (item: any) => (
      <button
        disabled={isPending}
        onClick={() => mutationFn(item.id)}
        className="flex items-center w-full h-full"
      >
        {loadingId !== item.id ? (
          <Check className="text-blue-500 text-center" size={20} />
        ) : (
          <PuffLoader color="#3b82f6" size={20} />
        )}
      </button>
    ),
  },
];

export const doctorColumns = [
  { header: "نام", accessor: "name" },
  { header: "تلفن", accessor: "phone" },
  { header: "تاریخ تولد", accessor: (row: any) => dateConvert(row.birth_date) },
  {
    header: "پنل مشاور",
    accessor: (row: any) => (
      <Link href={`/admin/doctors/panel/${row.id}`}>
        <ChartBar size={25} className="text-blue-500" />
      </Link>
    ),
  },
];

export const clientColumns = [
  { header: "نام", accessor: "name" },
  { header: "تلفن", accessor: "phone" },
  { header: "تاریخ تولد", accessor: (row: any) => dateConvert(row.birth_date) },
  {
    header: "پنل مراجع",
    accessor: (row: any) => (
      <Link href={`/admin/clients/${row.id}`}>
        <ChartBar size={25} className="text-blue-500" />
      </Link>
    ),
  },
];

export const therapistClientColumns = [
  { header: "نام", accessor: "name" },
  { header: "تلفن", accessor: "phone" },
  {
    header: "تاریخ تولد",
    accessor: (row: any) => (row.birth_date ? dateConvert(row.birth_date) : "—"),
  },
  {
    header: "پرونده",
    accessor: (row: any) => (
      <Link href={`/clients/${row.id}`} className="text-blue-600 hover:underline">
        مشاهده
      </Link>
    ),
  },
];

export const resourceColumns = [
  {
    header: "عنوان",
    accessor: (row: any) => row.title,
    cellClassName: () => "text-violet-600 font-medium",
  },
  {
    header: "نوع",
    accessor: (row: any) => (row.type === "file" ? "فایل" : "لینک"),
  },
  {
    header: "توضیحات",
    accessor: (row: any) => row.description || "—",
  },
  {
    header: "آدرس / فایل",
    accessor: (row: any) => {
      if (row.type === "link" && row.link) {
        return (
          <a
            href={row.link}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline"
          >
            مشاهده لینک
          </a>
        );
      }

      const filePath = row.file_path ?? row.filePath;
      if (row.type === "file" && filePath) {
        const base =
          process.env.NEXT_PUBLIC_API_URL ??
          process.env.API_URL ??
          "http://localhost:4000";
        const href = filePath.startsWith("http")
          ? filePath
          : `${base.replace(/\/$/, "")}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
        return (
          <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
            دانلود فایل
          </a>
        );
      }

      return "—";
    },
  },
];

export const assessmentsColumns = [
  {
    header: "مراجع",
    accessor: (row: any) => (
      <div className="relative inline-block">{row.client?.name}</div>
    ),
    cellClassName: (row: any) => "text-violet-500",
  },
  {
    header: "مشاور",
    accessor: (row: any) => (
      <div className="relative inline-block">
        {row.doctor?.name ?? row.therapist?.name}
      </div>
    ),
    cellClassName: (row: any) => "text-cyan-500",
  },
  { header: "تاریخ", accessor: (row: any) => dateConvert(row.date) },
  { header: "زمان", accessor: (row: any) => row.time },
  {
    header: "وضعیت",
    accessor: (row: any) =>
      row.status === "done" ? "انجام شده" : "انجام نشده",
    cellClassName: (row: any) =>
      row.status === "done" ? "text-blue-600" : "text-amber-500",
  },
];

export const workshopColumns = [
  { header: "عنوان", accessor: "title" },
  { header: "روز های برگزاری", accessor: "week_day" },
  { header: "زمان برگزاری", accessor: "time" },
  {
    header: "پنل کارگاه",
    accessor: (row: any) => (
      <Link href={`/dashboard/workshops/${row.id}`}>
        <ChartBar size={25} className="text-blue-500" />
      </Link>
    ),
  },
];

export const categoryColumns = [
  { header: "عنوان", accessor: "name" },
  { header: "اسلاگ", accessor: "slug" },
];

export const tagColumns = [
  { header: "عنوان", accessor: "name" },
  { header: "اسلاگ", accessor: "slug" },
];

export const departmentColumns = [
  { header: "عنوان", accessor: "title" },
  { header: "اسلاگ", accessor: "slug" },
];

export const paymentColumns = [
  { header: "مراجع", accessor: (item: any) => item.referral.client.name },
  { header: "مشاور", accessor: (item: any) => item.referral.doctor.name },
  {
    header: "تاریخ مراجعه",
    accessor: (item: any) => dateConvert(item.referral.date),
  },
  {
    header: "مبلغ",
    accessor: (item: any) => item.referral.amount,
    cellClassName: (item: any) =>
      item.status === "unpaid" ? "text-amber-500" : "text-sky-600",
  },
  {
    header: "وضعیت",
    accessor: (item: any) =>
      item.status === "paid" ? "پرداخت شده" : "پرداخت نشده",
    cellClassName: (item: any) =>
      item.status === "unpaid" ? "text-rose-500" : "text-green-500",
  },
];
