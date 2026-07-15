"use client";

import Header from "@/components/layout/Header";
import { useDashboard } from "@/hooks/useDashboard";
import { dateConvert } from "@/lib/utils";
import type { ReactNode } from "react";
import {
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PuffLoader } from "react-spinners";

function StatCard({
  title,
  value,
  icon,
  href,
  tone = "blue",
}: {
  title: string;
  value: number | string;
  icon: ReactNode;
  href?: string;
  tone?: "blue" | "cyan" | "amber" | "violet" | "emerald" | "rose";
}) {
  const tones: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };

  const content = (
    <div className={`rounded-xl border p-5 ${tones[tone]} transition hover:shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className="rounded-lg bg-white/70 p-2">{icon}</div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default function Home() {
  const { data, isLoading, error, refetch } = useDashboard();

  const stats = data ?? {};
  const recent = stats.recent_appointments ?? [];

  return (
    <div className="flex-1 h-screen overflow-y-auto flex flex-col">
      <Header isShowSearch={false} searchFn={() => {}} />

      <div className="flex-1 p-8 flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl">داشبورد روان‌درمانگر</h2>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm text-blue-600 hover:underline"
          >
            به‌روزرسانی
          </button>
        </div>

        <div className="mt-8 flex-1">
          {isLoading && (
            <div className="w-full h-64 flex items-center justify-center">
              <PuffLoader size={60} color="#3e86fa" />
            </div>
          )}

          {error && (
            <div className="w-full h-64 flex items-center justify-center">
              <p className="text-rose-500">خطا در دریافت اطلاعات داشبورد</p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <StatCard
                  title="نوبت‌های امروز"
                  value={stats.appointments_today ?? 0}
                  icon={<CalendarCheck size={22} />}
                  href="/appointments"
                  tone="blue"
                />
                <StatCard
                  title="نوبت‌های فردا"
                  value={stats.appointments_tomorrow ?? 0}
                  icon={<CalendarClock size={22} />}
                  href="/appointments"
                  tone="cyan"
                />
                <StatCard
                  title="۷ روز آینده"
                  value={stats.appointments_next7_days ?? 0}
                  icon={<CalendarDays size={22} />}
                  href="/appointments"
                  tone="violet"
                />
                <StatCard
                  title="مراجعین من"
                  value={stats.total_clients ?? 0}
                  icon={<Users size={22} />}
                  href="/clients"
                  tone="emerald"
                />
                <StatCard
                  title="ارزیابی‌های در انتظار"
                  value={stats.pending_assessments ?? 0}
                  icon={<ClipboardList size={22} />}
                  href="/assessments"
                  tone="amber"
                />
                <StatCard
                  title="اعلان‌های خوانده‌نشده"
                  value={stats.unread_notifications ?? 0}
                  icon={<Bell size={22} />}
                  href="/notifications"
                  tone="rose"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">آخرین نوبت‌ها</h3>
                  <Link href="/appointments" className="text-sm text-blue-600 hover:underline">
                    مشاهده همه
                  </Link>
                </div>

                {recent.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center">
                    هنوز نوبتی ثبت نشده است.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-right text-slate-500 border-b">
                          <th className="py-2 font-medium">مراجع</th>
                          <th className="py-2 font-medium">تاریخ</th>
                          <th className="py-2 font-medium">ساعت</th>
                          <th className="py-2 font-medium">وضعیت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map((item: any) => (
                          <tr key={item.id} className="border-b last:border-0">
                            <td className="py-3">
                              <Link
                                href={`/clients/${item.client?.id}`}
                                className="text-violet-600 hover:underline"
                              >
                                {item.client?.name ?? "—"}
                              </Link>
                            </td>
                            <td className="py-3">{dateConvert(item.date)}</td>
                            <td className="py-3">{item.time}</td>
                            <td
                              className={`py-3 ${
                                item.status === "done" ? "text-blue-600" : "text-amber-500"
                              }`}
                            >
                              {item.status === "done" ? "انجام شده" : "در انتظار"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Link
                  href="/clients"
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5 hover:bg-slate-100 transition"
                >
                  <h4 className="font-semibold">مراجعین</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    لیست مراجعین اختصاصی شما و دسترسی به پرونده پزشکی آن‌ها
                  </p>
                </Link>
                <Link
                  href="/resources"
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5 hover:bg-slate-100 transition"
                >
                  <h4 className="font-semibold">منابع</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    مدیریت لینک‌ها و فایل‌های پیشنهادی برای مراجعین
                  </p>
                </Link>
                <Link
                  href="/assessments"
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5 hover:bg-slate-100 transition"
                >
                  <h4 className="font-semibold">ارزیابی‌ها</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    پیگیری ارزیابی‌های انجام‌شده و در انتظار
                  </p>
                </Link>
                <Link
                  href="/resume"
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5 hover:bg-slate-100 transition"
                >
                  <h4 className="font-semibold">رزومه</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    ویرایش و به‌روزرسانی رزومه عمومی شما
                  </p>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
