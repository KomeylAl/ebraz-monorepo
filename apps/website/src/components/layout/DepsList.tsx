"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";
import DepItem from "./DepItem";
import { ensurePaginated } from "@/lib/public-api";

const DepsList = ({
  initialData,
  initialSearch,
}: {
  initialData: any;
  initialSearch: string;
}) => {
  const pageData = ensurePaginated(initialData);
  const [deps, setDeps] = useState(pageData.data);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(pageData.meta.current_page);
  const [lastPage, setLastPage] = useState(pageData.meta.last_page);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    router.push(`/posts?search=${encodeURIComponent(search)}`);
    setLoading(false);
  };

  useEffect(() => {
    const next = ensurePaginated(initialData);
    setDeps(next.data);
    setPage(next.meta.current_page);
    setLastPage(next.meta.last_page);
    setLoading(false);
  }, [initialData]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/departments?page=${nextPage}&search=${search}`,
      );
      const data = ensurePaginated(await res.json());
      setDeps((prev: any[]) => [...prev, ...data.data]);
      setPage(data.meta.current_page);
      setLastPage(data.meta.last_page);
    } catch (err) {
      console.error("Error loading more", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full flex flex-wrap items-center justify-center gap-16">
        {deps.map((item: any) => (
          <DepItem
            key={item.id}
            image={item.thumbnail}
            title={item.title}
            description={item.excerpt}
            slug={item.slug}
          />
        ))}
      </div>

      {page < lastPage && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "در حال بارگذاری..." : "بارگذاری موارد بیشتر"}
        </button>
      )}

      {loading && <PuffLoader color="#3b82f6" size={45} />}
    </div>
  );
};

export default DepsList;
