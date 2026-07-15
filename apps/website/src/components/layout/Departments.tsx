import React from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchSiteList } from "@/lib/public-api";

const Departments = async () => {
  const departments = await fetchSiteList<{
    id: string;
    slug: string;
    thumbnail?: string;
    title?: string;
  }>("api/departments", { next: { revalidate: 5 } });

  return (
    <div
      className="w-full px-5 md:px-24 lg:px-48 py-12 space-y-6 text-center"
      id="departments"
    >
      <h2 className="text-3xl font-semibold">دپارتمان های کلینیک ابراز</h2>
      <p className="text-xl">
        دپارتمان های تخصصی مرکز مشاوره و رواندرمانی ابراز
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {departments.data.length === 0 && (
          <p className="text-gray-500">دپارتمانی ثبت نشده است.</p>
        )}
        {departments.data.map((d) => (
          <Link key={d.id} href={`/departments/${d.slug}`}>
            {d.thumbnail ? (
              <Image
                src={d.thumbnail}
                width={600}
                height={300}
                alt={d.title ?? ""}
                className="object-cover w-80 saturate-0 hover:saturate-100 transition-all duration-500"
              />
            ) : (
              <div className="w-80 h-40 bg-gray-200 flex items-center justify-center text-gray-600">
                {d.title}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Departments;
