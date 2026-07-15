"use client";

import { useAssessments } from "@/hooks/useAssessments";
import { debounce } from "lodash";
import React, { useCallback, useState } from "react";
import { PuffLoader } from "react-spinners";
import Table from "@/components/common/Table";
import { assessmentsColumns } from "@/lib/columns";
import toast from "react-hot-toast";
import Header from "@/components/layout/Header";

const Assessments = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const [assessmentId, setAssessmentId] = useState("");
  const [assessment, setAssessment] = useState<any>({});

  const { data, isLoading, error, refetch } = useAssessments(
    page,
    pageSize,
    search
  );

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
        <div className="w-full h-full space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-2xl">ارزیابی ها</h2>
          </div>
          <div className="w-full h-full flex items-center justify-center">
            {isLoading && <PuffLoader size={60} color="#3e86fa" />}

            {error && (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-rose-500">خطا در دریافت اطلاعات</p>
              </div>
            )}

            {data && (
              <Table
                data={data.data ?? []}
                columns={assessmentsColumns}
                currentPage={data.meta?.current_page ?? 1}
                pageSize={data.meta?.per_page ?? 10}
                totalItems={data.meta?.total ?? 0}
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

export default Assessments;
