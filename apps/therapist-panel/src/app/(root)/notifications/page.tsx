"use client";

import Table from "@/components/common/Table";
import { AllNotificationsColumns } from "@/lib/columns";
import { useState } from "react";
import { useGetNotifications } from "@/hooks/useNotifications";
import Header from "@/components/layout/Header";
import { PuffLoader } from "react-spinners";
import { ensurePaginated } from "@ebraz/bff";

const Notifications = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error } = useGetNotifications(page, pageSize);
  const pageData = ensurePaginated(data);

  return (
    <div className="w-full h-full flex flex-col">
      <Header searchFn={() => {}} isShowSearch={false} />
      <div className="w-full flex flex-col p-12">
        <div className="w-full h-full space-y-6">
          <h2 className="font-bold text-2xl">اعلانات</h2>
          <div className="w-full h-full flex items-center justify-center">
            {isLoading && <PuffLoader size={60} color="#3e86fa" />}

            {error && (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-rose-500">خطا در دریافت اطلاعات</p>
              </div>
            )}

            {data && (
              <Table
                data={pageData.data}
                columns={AllNotificationsColumns}
                currentPage={pageData.meta.current_page}
                pageSize={pageData.meta.per_page}
                totalItems={pageData.meta.total}
                onPageChange={(newPage) => {
                  setPage(newPage);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
