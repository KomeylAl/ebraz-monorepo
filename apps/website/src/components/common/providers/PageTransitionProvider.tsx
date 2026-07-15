"use client";

import { animatePageIn } from "@/lib/animation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    animatePageIn();
  }, [pathname]); // اجرای انیمیشن در هر بار تغییر مسیر

  return <>{children}</>;
}
