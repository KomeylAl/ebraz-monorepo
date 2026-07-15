import CategoryList from "@/components/layout/CategoryList";
import Header from "@/components/layout/Header";
import SearchBar from "@/components/layout/SearchBar";
import { fetchSiteList } from "@/lib/public-api";
import Link from "next/link";
import React from "react";

const Categories = async ({
  searchParams,
}: {
  searchParams: {
    query: string;
  };
}) => {
  const { query } = await searchParams;

  const data = await fetchSiteList("api/categories", { next: { revalidate: 5 } });

  const latestPosts = await fetchSiteList("api/posts?page=1&per_page=5", {
    next: { revalidate: 5 },
  });
  return (
    <div>
      <Header pageTitle="دسته بندی ها" />
      <div className="w-full px-5 md:px-10 3xl:px-24 py-12 space-y-6 flex flex-col items-center">
        <div className="w-full flex flex-col lg:flex-row items-start gap-6">
          <div className="w-full md:w-96 space-y-6 md:sticky md:top-28">
            <div className="w-full p-4 rounded-lg border border-gray-200 bg-white">
              <SearchBar className="w-full" />
            </div>
            <div className="w-full p-4 rounded-lg border border-gray-200 bg-white space-y-4">
              <p className="">آخرین مطالب</p>
              <div className="w-full h-[1px] bg-beige" />
              <ul className="w-full flex flex-col gap-3 list-disc pr-6">
                {latestPosts.data.map((post: any) => (
                  <li
                    key={post.id}
                    className="hover:text-secodary transition-colors duration-300"
                  >
                    <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="w-full flex flex-col items-start gap-6">
            <CategoryList initialData={data} initialSearch={query ?? ""} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
