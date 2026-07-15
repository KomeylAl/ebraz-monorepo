import Header from "@/components/layout/Header";
import Image from "next/image";
import { fetchSiteLegacy } from "@/lib/public-api";
import Link from "next/link";
import React from "react";

import { CiFolderOn } from "react-icons/ci";
import { CiShoppingTag } from "react-icons/ci";

interface PostPageProps {
  params: {
    slug: string;
  };
}

const PostPage = async ({ params }: PostPageProps) => {
  const { slug } = await params;
  const post = (await fetchSiteLegacy(`api/posts/${slug}`, {
    next: { revalidate: 5 },
  })) as Record<string, any> | null;

  if (!post?.title) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        مطلب یافت نشد.
      </div>
    );
  }

  const tags = Array.isArray(post.tags) ? post.tags : [];
  const category = post.category;

  return (
    <div>
      <Header pageTitle={post.title} bread="وبلاگ" breadLink="/posts" />
      <div className="w-full px-5 md:px-24 lg:px-48 py-12 space-y-6 flex flex-col items-center">
        <div className="w-full h-64">
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              width={1200}
              height={400}
              className="object-cover w-full h-64 rounded-lg"
            />
          ) : null}
        </div>
        <div className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <h1 className="font-bold text-3xl">{post.title}</h1>
        </div>
        <div className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg space-y-4">
          <div className="w-full flex items-center gap-4">
            {category?.slug ? (
              <div className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                <CiFolderOn />
                <Link href={`/categories/${category.slug}`}>{category.name}</Link>
              </div>
            ) : null}
            <div className="flex items-center gap-2 text-gray-600 ">
              <CiShoppingTag />
              {tags.map((item: any) => (
                <Link
                  key={item.id}
                  className="hover:text-blue-500"
                  href={`/tags/${item.slug}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div
            className="text-justify leading-8"
            dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
          />
        </div>
      </div>
    </div>
  );
};

export default PostPage;
