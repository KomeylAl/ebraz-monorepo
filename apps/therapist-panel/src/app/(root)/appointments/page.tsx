"use client";

import { useCallback, useState } from "react";
import persian from "react-date-object/calendars/persian";
import DatePicker, { DateObject } from "react-multi-date-picker";
import fa from "react-date-object/locales/persian_fa";
import { useAppointments } from "@/hooks/useAppointments";
import { debounce } from "lodash";
import { PuffLoader } from "react-spinners";
import Table from "@/components/common/Table";
import { appointmentColumns } from "@/lib/columns";
import Header from "@/components/layout/Header";

const Appinments = () => {
  const [value, setValue] = useState<DateObject>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const baseDate = value
    ? value.toDate().toISOString().slice(0, 19).replace("T", " ").slice(0, 10)
    : "";

  const {
    data: baseData,
    isLoading: baseLoading,
    error: baseError,
    refetch,
  } = useAppointments(page, pageSize, search, baseDate);

  const debouncedSearch = useCallback(
    debounce((text) => {
      refetch();
    }, 300),
    [refetch]
  );

  const onSearchChange = (e: any) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Header searchFn={onSearchChange} isShowSearch />
      <div className="w-full flex flex-col p-12">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 lg:items-center lg:justify-between">
          <h2 className="font-bold text-2xl">نوبت ها</h2>

          <div className="flex md:flex-row flex-col items-start gap-3">
            <DatePicker
              inputClass="py-2 bg-blue-600 rounded-md text-white text-center placeholder-white"
              placeholder="انتخاب تاریخ"
              calendar={persian}
              locale={fa}
              value={value}
              format="YYYY-MM-DD"
              onChange={(date: any) => {
                setValue(date);
                refetch();
              }}
            />
          </div>
        </div>
        <div className="w-full h-full flex items-center justify-center mt-8">
          {baseLoading && <PuffLoader size={60} color="#3e86fa" />}

          {baseError && (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-rose-500">خطا در دریافت اطلاعات</p>
            </div>
          )}

          {baseData && (
            <Table
              data={baseData.data ?? []}
              columns={appointmentColumns}
              currentPage={baseData.meta?.current_page ?? 1}
              pageSize={baseData.meta?.per_page ?? 10}
              totalItems={baseData.meta?.total ?? 0}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Appinments;
