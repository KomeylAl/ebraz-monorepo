import Image from "next/image";
import React from "react";
import imagess from "../../../public/images/hero2.webp";
import { dateConvert } from "@/lib/utils";
import Link from "next/link";
import TransitionLink from "../ui/TransitionLink";

interface CategoryItemProps {
  title: string;
  description: string;
  image: string;
  slug: string;
}

function previewText(text: string, maxLength = 100) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

const CategoryItem = ({
  title,
  description,
  image,
  slug,
}: CategoryItemProps) => {
  return (
    <div className="w-80 h-[440px] min-h-[440px] group rounded-md space-y-3 relative bg-white shadow-lg flex flex-col">
      <Image
        src={image || imagess}
        alt=""
        width={300}
        height={300}
        className="w-full h-44 rounded-t-md object-cover saturate-0 group-hover:saturate-100 transition-all duration-300 z-10"
      />
      <div className="w-full h-full flex-1 flex flex-col items-start justify-between">
        <div className="w-full p-4 flex flex-col items-start space-y-2">
          <p className="font-semibold text-right">{title}</p>
          <p className="text-right">{previewText(description, 100)}</p>
        </div>
        <div className="w-full p-4">
          <TransitionLink href={`/categories/${slug}`}>
            <div className="w-full px-4 py-2 rounded-md border border-beige text-beige text-center group-hover:bg-black/85 transition-all duration-300">
              اطلاعات بیشتر
            </div>
          </TransitionLink>
        </div>
      </div>
    </div>
  );
};

export default CategoryItem;
