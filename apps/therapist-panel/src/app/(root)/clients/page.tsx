"use client";

import { useCallback, useState } from "react";
import { debounce } from "lodash";
import { PuffLoader } from "react-spinners";
import Header from "@/components/layout/Header";
import Table from "@/components/common/Table";
import { therapistClientColumns } from "@/lib/columns";
import { useClients } from "@/hooks/useClients";

export default function ClientsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading, error, refetch } = useClients(page, pageSize, search);

  const debouncedSearch = useCallback(
    debounce(() => {
      refetch();
    }, 300),
    [refetch],
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    debouncedSearch();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Header searchFn={onSearchChange} isShowSearch />
      <div className="w-full flex flex-col p-12">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl">مراجعین من</h2>
        </div>

        <div className="w-full h-full flex items-center justify-center mt-8">
          {isLoading && <PuffLoader size={60} color="#3e86fa" />}

          {error && (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-rose-500">خطا در دریافت اطلاعات</p>
            </div>
          )}

          {data && (
            <Table
              data={data.data ?? []}
              columns={therapistClientColumns}
              currentPage={data.meta?.current_page ?? 1}
              pageSize={data.meta?.per_page ?? 10}
              totalItems={data.meta?.total ?? 0}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
