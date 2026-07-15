"use client";

import React, { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";
import { Button } from "../ui/button";
import CategoryItem from "./CategoryItem";
import { ensurePaginated } from "@/lib/public-api";

export default function CategoryList({
  initialData,
  initialSearch,
}: {
  initialData: any;
  initialSearch: string;
}) {
  const pageData = ensurePaginated(initialData);
  const [categories, setCategories] = useState(pageData.data);
  const [page, setPage] = useState(pageData.meta.current_page);
  const [lastPage, setLastPage] = useState(pageData.meta.last_page);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const next = ensurePaginated(initialData);
    setCategories(next.data);
    setPage(next.meta.current_page);
    setLastPage(next.meta.last_page);
    setLoading(false);
  }, [initialData]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/categories?page=${nextPage}`);
      const data = ensurePaginated(await res.json());
      setCategories((prev: any[]) => [...prev, ...data.data]);
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
      <div className="w-full flex flex-wrap items-center justify-start gap-16">
        {categories.length === 0 && (
          <p className="text-gray-500">هیچ دسته بندی ای پیدا نشد.</p>
        )}

        {categories.map((item: any) => (
          <CategoryItem
            key={item.id}
            image={item.image}
            title={item.name}
            description={item.excerpt}
            slug={item.slug}
          />
        ))}
      </div>

      {page < lastPage && (
        <Button onClick={loadMore} disabled={loading}>
          {loading ? "در حال بارگذاری..." : "بارگذاری موارد بیشتر"}
        </Button>
      )}

      {loading && <PuffLoader color="#3b82f6" size={45} />}
    </div>
  );
}
