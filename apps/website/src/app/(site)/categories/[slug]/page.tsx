import Header from "@/components/layout/Header";
import Image from "next/image";
import { fetchSiteLegacy } from "@/lib/public-api";
import React from "react";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { slug } = await params;
  const category = ((await fetchSiteLegacy(`api/categories/${slug}`, {
    next: { revalidate: 5 },
  })) ?? {}) as Record<string, any>;

  if (!category.name) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        دسته بندی یافت نشد.
      </div>
    );
  }

  return (
    <div>
      <Header
        pageTitle={category.name}
        bread="دسته بندی ها"
        breadLink="/posts"
      />
      <div className="w-full px-5 md:px-24 lg:px-48 py-12 space-y-6 flex flex-col items-center">
        <div className="w-full h-64">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              width={1200}
              height={400}
              className="object-cover w-full h-64 rounded-lg"
            />
          ) : null}
        </div>
        <div className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <h1 className="font-bold text-3xl">{category.name}</h1>
        </div>
        <div className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg space-y-4">
          <div
            className="text-justify leading-8"
            dangerouslySetInnerHTML={{ __html: category.content ?? "" }}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
