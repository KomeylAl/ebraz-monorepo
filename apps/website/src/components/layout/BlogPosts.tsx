import React from "react";
import BlogPostItem from "./BlogPostItem";
import Link from "next/link";
import { fetchSiteList } from "@/lib/public-api";

const BlogPosts = async () => {
  const data = await fetchSiteList("api/posts?page=1&per_page=4", {
    next: { revalidate: 5 },
  });
  const posts = data.data.filter(
    (post: any) => !post.status || post.status === "published",
  );

  return (
    <div className="w-full px-5 md:px-24 lg:px-48 py-12 space-y-8 text-center mt-10">
      <h2 className="text-3xl font-semibold">وبلاگ کلینیک ابراز</h2>
      <p className="text-xl">آخرین مقالات منتشر شده در وبلاگ مرکز ابراز</p>
      <div className="w-full flex flex-wrap items-center justify-center gap-16">
        {posts.map((post: any) => (
          <BlogPostItem
            key={post.id}
            title={post.title}
            description={post.excerpt}
            image={post.thumbnail}
            date={post.published_at ?? post.publishedAt}
            slug={post.slug}
            category={post.category}
          />
        ))}
      </div>
      <Link
        href="/posts"
        className="w-80 px-20 py-2 bg-black/75 text-beige mt-12 rounded-md hover:text-white hover:bg-black/95 transition-all duration-300"
      >
        مشاهده همه
      </Link>
    </div>
  );
};

export default BlogPosts;
