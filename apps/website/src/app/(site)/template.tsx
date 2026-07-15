"use client";

import Image from "next/image";
import { useEffect } from "react";
import logo from "../../../public/images/logo.png";
import { animatePageIn } from "@/lib/animation";

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    animatePageIn(); // اینجا دوباره اجرا می‌شه وقتی صفحه مقصد لود شد
  }, []);

  return (
    <div>
      <div
        id="banner"
        className="min-h-screen bg-white/60 z-30 fixed top-0 w-full backdrop-blur-xl flex items-center justify-center"
      >
        <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
          <Image src={logo} alt="Logo" width={100} height={300} />
          <p className="text-lg">در حال بارگزاری...</p>
        </div>
      </div>
      {children}
    </div>
  );
}
