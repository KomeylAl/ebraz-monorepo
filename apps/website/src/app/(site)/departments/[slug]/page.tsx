import Header from "@/components/layout/Header";
import { fetchSiteLegacy } from "@/lib/public-api";
import Image from "next/image";
import React from "react";

interface DepPageProps {
  params: {
    slug: string;
  };
}

const Department = async ({ params }: DepPageProps) => {
  const { slug } = await params;
  const department = ((await fetchSiteLegacy(`api/departments/${slug}`, {
    next: { revalidate: 5 },
  })) ?? {}) as Record<string, any>;

  if (!department.title) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        دپارتمان یافت نشد.
      </div>
    );
  }

  return (
    <div>
      <Header
        pageTitle={department.title}
        bread="دپارتمان ها"
        breadLink="/departments"
      />
      <div className="w-full px-5 md:px-24 lg:px-48 py-12 space-y-6 flex flex-col items-center">
        <div className="w-full h-64">
          {department.thumbnail ? (
            <Image
              src={department.thumbnail}
              alt={department.title}
              width={1200}
              height={400}
              className="object-cover w-full h-64 rounded-lg"
            />
          ) : null}
        </div>
        <div className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <h1 className="font-bold text-3xl">{department.title}</h1>
        </div>
        <div className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg space-y-4">
          <div
            className="text-justify leading-8"
            dangerouslySetInnerHTML={{ __html: department.content ?? "" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Department;
