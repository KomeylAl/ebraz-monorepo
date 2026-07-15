"use client";

import React, { useEffect, useState, useRef } from "react";
import PsyItem from "@/components/layout/PsyItem";
import { PuffLoader } from "react-spinners";
import { ensurePaginated } from "@/lib/public-api";

export default function PsyList({
  initialData,
  initialSearch,
}: {
  initialData: any;
  initialSearch: string;
}) {
  const pageData = ensurePaginated(initialData);
  const [doctors, setDoctors] = useState(pageData.data);
  const [page, setPage] = useState(pageData.meta.current_page);
  const [lastPage, setLastPage] = useState(pageData.meta.last_page);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const next = ensurePaginated(initialData);
    setDoctors(next.data);
    setPage(next.meta.current_page);
    setLastPage(next.meta.last_page);
    setLoading(false);
  }, [initialData]);

  const loadMore = async () => {
    if (loading || page >= lastPage) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/doctors?page=${nextPage}&sort_direction=asc`,
      );
      const data = ensurePaginated(await res.json());
      setDoctors((prev: any[]) => [...prev, ...data.data]);
      setPage(data.meta.current_page);
      setLastPage(data.meta.last_page);
    } catch (err) {
      console.error("Error loading more", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1 },
    );

    const el = loaderRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [page, lastPage, loading]);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full flex flex-wrap items-center justify-center gap-6">
        {doctors.length === 0 && (
          <p className="text-gray-500">هیچ مشاوری پیدا نشد.</p>
        )}

        {doctors.map((item: any) => (
          <PsyItem
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.avatar}
            resume={item.resume}
            departments={item.departments}
            days={item.days}
          />
        ))}
      </div>

      <div ref={loaderRef} className="h-10 w-full"></div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3">
          <PuffLoader color="#3b82f6" size={45} />
          <p>در حال بارگزاری موارد بیشتر...</p>
        </div>
      )}
    </div>
  );
}
