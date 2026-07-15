import Header from "@/components/layout/Header";
import RegisterButton from "@/components/layout/RegisterButton";
import { fetchSiteLegacy } from "@/lib/public-api";
import { dateConvert } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface WorkshopPageProps {
  params: {
    id: string;
  };
}

const Workshop = async ({ params }: WorkshopPageProps) => {
  const { id } = await params;
  const workshop = ((await fetchSiteLegacy(`api/workshops/${id}`, {
    next: { revalidate: 5 },
  })) ?? {}) as Record<string, any>;

  if (!workshop.id) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        کارگاه یافت نشد.
      </div>
    );
  }

  const endDate = workshop.end_date ?? workshop.endDate;
  const date = endDate ? new Date(endDate) : new Date(0);
  const now = new Date();
  return (
    <div>
      <Header
        pageTitle={workshop.title ?? ""}
        bread="کارگاه ها"
        breadLink="/workshops"
      />
      <div className="w-full px-5 md:px-24 lg:px-48 py-12 space-y-6 flex flex-col items-center">
        <div className="w-full flex flex-col md:flex-row items-start justify-start gap-4">
          <div className="w-96 h-96 relative overflow-hidden">
            <div
              className={`absolute w-48 h-10 ${
                date < now
                  ? "bg-primary text-shelfish"
                  : "bg-beige/80 backdrop-blur-sm text-zinc-900"
              } top-5 -right-15 rotate-45 flex items-center justify-center`}
            >
              {date < now ? "برگزار شده" : "در حال برگزاری"}
            </div>
            <Image
              src={workshop.img_path ?? workshop.imgPath}
              alt={workshop.title ?? ""}
              width={1200}
              height={400}
              className="object-cover w-96 h-96 rounded-lg"
            />
          </div>
          <div>
            <div className="w-full p-4 space-y-5">
              <h1 className="font-bold text-3xl">{workshop.title}</h1>
              <p>برگزار کنندگان: {workshop.organizers}</p>
              <p>روز های برگزاری: {workshop.week_day ?? workshop.weekDay}</p>
              <p>تاریخ شروع: {dateConvert(workshop.start_date ?? workshop.startDate)}</p>
              <p>تاریخ پایان: {dateConvert(endDate)}</p>
              <p>زمان برگزاری: {workshop.time}</p>
              {date < now ? (
                <div className="w-full px-4 py-2 rounded-md border border-primary text-primary flex items-center justify-center hover:bg-beige hover:text-black transition duration-300">
                  زمان ثبت نام این کارگاه به پایان رسیده است.
                </div>
              ) : (
                <RegisterButton id={id} />
              )}
            </div>
          </div>
        </div>
        <div className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg space-y-4">
          <div
            className="text-justify leading-8"
            dangerouslySetInnerHTML={{ __html: workshop.content }}
          />
        </div>
      </div>
    </div>
  );
};

export default Workshop;
