import Image from "next/image";
import React from "react";
import logo from "../../../../public/images/logo.png";
import { BiMapPin, BiMobile, BiPhone } from "react-icons/bi";
import Header from "@/components/layout/Header";
import { Metadata } from "next";
import MapWrapper from "@/components/layout/MapWrapper";
import { fetchSiteLegacy } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "درباره و تماس با ما - مرکز جامع مشاوره و رواندرمانی ابراز",
  description:
    "با تاسیس و مدیریت دکتر علی محرابی، متخصص روانشناسی بالینی و عضو هیئت علمی دانشگاه اصفهان",
};

const About = async () => {
  const data =
    ((await fetchSiteLegacy("api/about", { next: { revalidate: 5 } })) as Record<
      string,
      any
    > | null) ?? {};

  return (
    <div>
      <Header pageTitle="درباره و تماس با ما" />
      <div className="w-full px-5 md:px-24 lg:px-48 py-12 space-y-6 flex flex-col items-center">
        <Image
          src={data.logo_path || data.logoPath || logo}
          alt=""
          width={300}
          height={300}
          className="w-32"
        />
        <div className="w-full flex flex-col xl:flex-row items-center justify-center gap-10 xl:h-[500px]">
          <div className="flex-1 space-y-5">
            <h2 className="text-xl font-semibold">{data.title ?? ""}</h2>
            <p className="text-justify">{data.about ?? ""}</p>
            <div>
              <div className="flex gap-2 mt-6 items-center">
                <BiMapPin size={30} /> <p>{data.address ?? ""}</p>
              </div>
              <div className="flex gap-2 mt-6 items-center">
                <BiPhone size={30} /> <p>{data.phones ?? ""}</p>
              </div>
              <div className="flex gap-2 mt-6 items-center">
                <BiMobile size={30} />{" "}
                <p>{data.mobile_phones ?? data.mobilePhones ?? ""}</p>
              </div>
            </div>
          </div>
          <div className="w-[1px] h-full bg-gray-200" />
          <div className="xl:flex-1 w-full h-[400px] overflow-hidden shadow-lg">
            <MapWrapper lat={Number(data.lat ?? 0)} long={Number(data.long ?? 0)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
