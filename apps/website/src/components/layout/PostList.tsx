"use client";

import React, { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";
import BlogPostItem from "./BlogPostItem";
import { Button } from "../ui/button";
import { ensurePaginated } from "@/lib/public-api";

export default function PostsList({
  initialData,
  initialSearch,
}: {
  initialData: any;
  initialSearch: string;
}) {
  const pageData = ensurePaginated(initialData);
  const [posts, setPosts] = useState(pageData.data);
  const [page, setPage] = useState(pageData.meta.current_page);
  const [lastPage, setLastPage] = useState(pageData.meta.last_page);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const next = ensurePaginated(initialData);
    setPosts(next.data);
    setPage(next.meta.current_page);
    setLastPage(next.meta.last_page);
    setLoading(false);
  }, [initialData]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/posts?page=${nextPage}`);
      const data = ensurePaginated(await res.json());
      setPosts((prev: any[]) => [...prev, ...data.data]);
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
        {posts.length === 0 && (
          <p className="text-gray-500">هیچ مطلبی پیدا نشد.</p>
        )}

        {posts.map((item: any) => (
          <BlogPostItem
            key={item.id}
            image={item.thumbnail}
            title={item.title}
            description={item.excerpt}
            date={item.published_at ?? item.publishedAt}
            slug={item.slug}
            category={item.category}
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
