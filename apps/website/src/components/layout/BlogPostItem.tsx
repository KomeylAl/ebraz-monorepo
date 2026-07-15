import Image from "next/image";
import React from "react";
import imagess from "../../../public/images/hero2.webp";
import { dateConvert } from "@/lib/utils";
import Link from "next/link";
import TransitionLink from "../ui/TransitionLink";

interface BlogPostItemProps {
  title: string;
  description: string;
  image: string;
  date: string;
  slug: string;
  category: any;
}

function previewText(text: string, maxLength = 100) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

const BlogPostItem = ({
  title,
  description,
  image,
  date,
  slug,
  category,
}: BlogPostItemProps) => {
  const cDate = dateConvert(date);
  return (
    <div className="w-80 h-[440px] min-h-[440px] group rounded-md space-y-3 relative bg-white shadow-lg flex flex-col">
      <Image
        src={image || imagess}
        alt=""
        width={300}
        height={300}
        className="w-full h-44 rounded-t-md object-cover transition-all duration-300 z-10"
      />
      <div className="absolute top-28 left-0 w-12 h-40 -z-10 group-hover:-translate-x-12 rounded-l-md bg-black/85 transition-all duration-300">
        <div className="w-full h-full relative flex flex-col items-center justify-center gap-3 text-shelfish">
          <Image
            src={image || imagess}
            alt=""
            width={300}
            height={300}
            className="w-full h-40 object-cover opacity-15 absolute"
          />
          <p>{cDate.split("/")[2]}</p>
          <p>{cDate.split("/")[1]}</p>
          <p>{cDate.split("/")[0]}</p>
        </div>
      </div>
      <div className="w-full h-full flex-1 flex flex-col items-start justify-between">
        <div className="w-full p-4 flex flex-col items-start space-y-2">
          <p className="font-semibold text-right">{title}</p>
          {category?.slug ? (
            <p className="text-sm text-[#2daa9e]">
              <TransitionLink href={`/categories/${category.slug}`}>
                {category.name}
              </TransitionLink>
            </p>
          ) : null}
          <p className="text-right">{previewText(description, 100)}</p>
        </div>
        <div className="w-full p-4">
          <TransitionLink href={`/posts/${slug}`}>
            <div className="w-full px-4 py-2 rounded-md border border-beige text-beige text-center group-hover:bg-black/85 transition-all duration-300">
              اطلاعات بیشتر
            </div>
          </TransitionLink>
        </div>
      </div>
    </div>
  );
};

export default BlogPostItem;
