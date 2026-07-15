import Image from "next/image";
import React from "react";
import { BiMapPin, BiMobile, BiPhone } from "react-icons/bi";

import logow from "../../../public/images/logo-w.png";

const Footer = () => {
  return (
    <footer className="w-full h-fit">
      <div className="w-full h-fit bg-black/75 p-16 lg:px-48 space-y-8">
        <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="text-white flex flex-col gap-3">
            <h2 className="text-2xl text-beige">
              کلینیک تخصصی مشاوره و روان درمانی ابراز
            </h2>
            <p>
              با تاسیس و مدیریت دکتر علی محرابی، متخصص روانشناسی بالینی و عضو
              هیئت علمی دانشگاه اصفهان
            </p>
            <div>
              <div className="flex gap-2 mt-6 items-center">
                <BiMapPin size={30} />{" "}
                <p>
                  اصفهان، خ هزارجریب، خ آزادی یا کلینی (مرداویج)، خ ملاصدرای
                  جنوبی، بن بست شاهد، پلاک ۹
                </p>
              </div>
              <div className="flex gap-2 mt-6 items-center">
                <BiPhone size={30} />{" "}
                <p>03191095184 - 03191093136 - 03136680262 - 03136680290</p>
              </div>
              <div className="flex gap-2 mt-6 items-center">
                <BiMobile size={30} /> <p>09228728245</p>
              </div>
            </div>
          </div>
          <Image src={logow} alt="logo" width={100} height={200} />
        </div>
        <div className="w-full h-[1px] bg-gray-300/50" />
        <p className="text-white text-center">
          تمامی حقوق برای کلینیک ابراز محفوظ است. طراحی وب سایت کلینیک ابراز توسط{" "}
          <span className="hover:text-beige">
            <a href="https://atrinadev.com" target="_blank">گروه نرم‌افزاری آترینا</a>
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
