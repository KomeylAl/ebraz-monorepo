import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import WorkshopItem from "./WorkshopItem";
import { fetchSiteList } from "@/lib/public-api";

const WorkShops = async () => {
  const data = await fetchSiteList("api/workshops?page=1&per_page=10", {
    next: { revalidate: 5 },
  });
  const workshops = data.data;

  return (
    <div className="w-full h-[630px] mt-10 workshop">
      <div className="w-full h-full px-5 md:px-24 lg:px-32 py-12 space-y-6 text-center bg-black/80 text-white">
        <h2 className="text-3xl font-semibold">کلاس ها و کارگاه ها</h2>
        <p className="text-xl">لیست کلاس ها و کارگاهی های جاری در مرکز ابراز</p>

        {workshops.length === 0 && <p>هنوز کارگاهی اضافه نشده است!</p>}

        {workshops.length !== 0 && (
          <Carousel
            className="mt-16"
            opts={{
              align: "end",
              axis: "x",
              direction: "rtl",
            }}
          >
            <CarouselContent className="text-black">
              {workshops.map((item: any) => (
                <CarouselItem className="lg:basis-1/2 xl:basis-1/4" key={item.id}>
                  <WorkshopItem
                    title={item.title}
                    image={item.img_path ?? item.imgPath}
                    day={item.day ?? item.week_day ?? item.weekDay}
                    id={item.id}
                    organizers={item.organizers}
                    endDate={item.end_date ?? item.endDate}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNext className="text-black hidden md:block" />
            <CarouselPrevious className="text-black hidden md:block" />
          </Carousel>
        )}
      </div>
    </div>
  );
};

export default WorkShops;
