import BlogPosts from "@/components/layout/BlogPosts";
import Comments from "@/components/layout/Comments";
import Departments from "@/components/layout/Departments";
import Hero from "@/components/layout/Hero";
import WorkShops from "@/components/layout/WorkShops";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "خانه - مرکز تخصصی مشاوره و رواندرمانی ابراز",
  description:
    "با تاسیس و مدیریت دکتر علی محرابی، متخصص روانشناسی بالینی و عضو هیئت علمی دانشگاه اصفهان",
};

export default function Home() {
  return (
    <main className="">
      <div className="w-full">
        <Hero />
        <Departments />
        <BlogPosts />
        <WorkShops />
        <Comments />
      </div>
    </main>
  );
}
