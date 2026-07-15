"use client";
import { useUser } from "@/contexts/UserContext";
import {
  Bell,
  CalendarCheck,
  CalendarFold,
  FileUser,
  LayoutDashboard,
  Settings,
  SwatchBook,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { PuffLoader } from "react-spinners";
import TransitionLink from "../common/TransitionLink";

const Navbar = () => {
  const links = [
    {
      title: "داشبورد",
      link: "/",
      icon: <LayoutDashboard />,
    },
    {
      title: "مراجعین",
      link: "/clients",
      icon: <Users />,
    },
    {
      title: "منابع",
      link: "/resources",
      icon: <SwatchBook />,
    },
    {
      title: "رزومه",
      link: "/resume",
      icon: <FileUser />,
    },
    {
      title: "نوبت ها",
      link: "/appointments",
      icon: <CalendarCheck />,
    },
    {
      title: "ارزیابی ها",
      link: "/assessments",
      icon: <CalendarFold />,
    },
    {
      title: "اعلانات",
      link: "/notifications",
      icon: <Bell />,
    },
    {
      title: "تنظیمات",
      link: "/settings",
      icon: <Settings />,
    },
  ];

  const pathName = usePathname();
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-4 w-full">
      {!user && (
        <div className="w-full h-full flex items-center justify-center">
          <PuffLoader color="#3b82f6" size={45} />
        </div>
      )}

      {user &&
        links.map((link) => (
          <TransitionLink
            key={link.link}
            href={link.link}
            className={`flex items-center gap-2 text-lg w-full px-4 py-2 ${
              pathName === link.link || (link.link !== "/" && pathName.startsWith(link.link))
                ? "bg-blue-100 dark:bg-blue-950 text-blue-600 font-semibold rounded-sm"
                : "bg-transparent"
            }`}
          >
            {link.icon} {link.title}
          </TransitionLink>
        ))}
    </div>
  );
};

export default Navbar;
