"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import { BiArrowToRight } from "react-icons/bi";
import TransitionLink from "../ui/TransitionLink";
import { motion, AnimatePresence, m } from "framer-motion";
import logo from "../../../public/images/logo-w.png";

import workshop from "../../../public/images/in1.jpg";
import blog from "../../../public/images/blog.webp";
import appointment from "../../../public/images/appointment.webp";
import organ from "../../../public/images/organ.webp";

const megaMenuData: any = {
  appointment: {
    title: "دریافت نوبت",
    desc: "دیدن نحوه دریافت نوبت و دریافت نوبت ارزیابی اولیه رایگان.",
    image: appointment,
    links: [
      { label: "رزرو نوبت جدید", href: "/appointment" },
      { label: "لیست روان‌درمانگران", href: "/psychologists" },
      {
        label: "دریافت نوبت ارزیابی اولیه رایگان",
        href: "/appointment/#assessment",
      },
    ],
  },
  departments: {
    title: "چارت سازمانی",
    desc: "مشاهده چارت سازمانی مرکز ابراز.",
    image: organ,
    links: [
      { label: "واحد تست و ارزیابی", href: "/appointment" },
      { label: "واحد مدیریت", href: "/psychologists" },
      {
        label: "دپارتمان ها",
        href: "/appointment/#assessment",
      },
    ],
  },
  workshops: {
    title: "کارگاه‌ها",
    desc: "کارگاه‌های عمومی تخصصی روانشناسی با مدرسین برجسته.",
    image: workshop,
    links: [
      { label: "کارگاه‌های عمومی", href: "/workshops?type=general" },
      { label: "کارگاه‌های تخصصی", href: "/workshops?type=special" },
    ],
  },
  posts: {
    title: "مجله ابراز",
    desc: "مطالب علمی، نکات روانشناسی، خودآگاهی و رشد فردی.",
    image: blog,
    links: [
      { label: "مطالب عمومی", href: "/posts?type=general" },
      { label: "مطالب تخصصی", href: "/posts?type=specialized" },
      { label: "اخبار روانشناسی", href: "/news" },
    ],
  },
};

const items = [
  { title: "خانه", link: "/" },
  {
    title: "دریافت نوبت",
    link: "appointment",
    mega: true,
    dataKey: "appointment",
  },
  { title: "چارت سازمانی", link: null, mega: true, dataKey: "departments" },
  { title: "کارگاه ها", link: "workshops", mega: true, dataKey: "workshops" },
  { title: "مجله ابراز", link: "posts", mega: true, dataKey: "posts" },
  { title: "متخصصان", link: "/psychologists" },
  { title: "درباره مرکز ابراز", link: "/about" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<Set<string>>(
    new Set(),
  );

  const toggleMobileMenu = (key: string) => {
    const newSet = new Set(expandedMobileMenus);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedMobileMenus(newSet);
  };

  return (
    <div className="relative p-4">
      {/* Navbar */}
      <div className="w-full flex lg:flex-row-reverse items-center lg:justify-between gap-6 p-4 xl:px-32 lg:py-4 bg-black/30 backdrop-blur-md rounded-lg !z-1000">
        {/* موبایل */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden"
        >
          <HiMenuAlt4 className="text-shelfish" size={30} />
        </button>

        {/* منوی موبایل */}
        <div
          className={`fixed top-0 right-0 z-10 lg:hidden h-screen w-56 bg-white flex flex-col items-center justify-center gap-10 shadow-lg transform ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          <div className="fixed top-10 right-10 z-10">
            <button onClick={() => setIsMenuOpen(false)}>
              <BiArrowToRight size={30} />
            </button>
          </div>
          <nav>
            <ul className="flex flex-col items-start gap-6 w-full px-4">
              {items.map((item) => (
                <li key={item.title} className="w-full">
                  {item.mega ? (
                    <>
                      <button
                        onClick={() => toggleMobileMenu(item.dataKey)}
                        className="text-lg font-semibold text-gray-500 hover:text-gray-800 transition-all w-full text-right py-2"
                      >
                        {item.title}
                      </button>
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={
                          expandedMobileMenus.has(item.dataKey)
                            ? { opacity: 1, height: "auto" }
                            : { opacity: 0, height: 0 }
                        }
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex flex-col items-start gap-2 pr-4 border-r-2 border-gray-300 mt-2 w-full overflow-hidden"
                      >
                        {megaMenuData[item.dataKey].links.map((link: any) => (
                          <li key={link.href}>
                            <div
                              onClick={() => {
                                setIsMenuOpen(false);
                                setExpandedMobileMenus(new Set());
                              }}
                            >
                              <TransitionLink
                                href={link.href}
                                className="text-sm text-gray-600 hover:text-gray-800 transition-all"
                              >
                                {link.label}
                              </TransitionLink>
                            </div>
                          </li>
                        ))}
                      </motion.ul>
                    </>
                  ) : (
                    <div onClick={() => setIsMenuOpen(false)}>
                      <TransitionLink
                        href={item.link!}
                        className={`${
                          pathname === item.link
                            ? "text-gray-800"
                            : "text-gray-500"
                        } text-lg font-semibold hover:text-gray-800 transition-all duration-200 block py-2`}
                      >
                        {item.title}
                      </TransitionLink>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* لوگو */}
        <div className="flex items-center gap-2">
          <Image src={logo} alt="لوگو" width={30} height={100} />
          <p className="font-semibold text-white text-xl hidden xl:block">کلینیک ابراز</p>
        </div>

        {/* دسکتاپ */}
        <nav>
          <ul className="w-full hidden lg:flex items-center gap-16 text-white">
            {items.map((item) => (
              <li
                key={item.title}
                onMouseEnter={() => item.mega && setActiveMega(item.dataKey)}
                onMouseLeave={() => item.mega && setActiveMega(null)}
                className={`relative ${
                  pathname === item.link
                    ? "text-beige font-semibold"
                    : "text-shelfish"
                } text-xl hover:text-beige transition-all duration-200 ${
                  item.mega ? "cursor-default" : "cursor-pointer"
                }`}
              >
                {item.mega ? (
                  <span>{item.title}</span>
                ) : (
                  <TransitionLink href={item.link!}>
                    {item.title}
                  </TransitionLink>
                )}

                {/* خط زیر لینک (Hover Effect) */}
                {item.mega && (
                  <div className="absolute left-0 right-0 -bottom-2 h-[2px] bg-beige opacity-0 group-hover:opacity-100 transition-all"></div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* مگامنو */}
      <AnimatePresence>
        {activeMega && (
          <div className="relative w-full px-4 pt-2">
            <motion.div
            key={activeMega}
            onMouseEnter={() => setActiveMega(activeMega)}
            onMouseLeave={() => setActiveMega(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-full left-0 rounded-lg w-full h-96 bg-shelfish shadow-xl z-10 flex overflow-hidden"
          >
            {/* عکس */}
            <motion.div
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-1/2 h-full relative"
            >
              <Image
                src={megaMenuData[activeMega].image}
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </motion.div>

            {/* محتوا */}
            <div className="w-1/2 p-12 flex flex-col gap-6 justify-center">
              <motion.h2
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="text-3xl font-bold text-gray-800"
              >
                {megaMenuData[activeMega].title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="text-gray-600 leading-7"
              >
                {megaMenuData[activeMega].desc}
              </motion.p>

              <motion.div
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
                  },
                }}
                className="flex flex-col gap-3 mt-4"
              >
                {megaMenuData[activeMega].links.map((link: any) => (
                  <motion.div
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, x: 10 },
                      show: { opacity: 1, x: 0 },
                    }}
                  >
                    <TransitionLink
                      href={link.href}
                      className="text-lg text-primary hover:text-beige transition-all"
                    >
                      {link.label}
                    </TransitionLink>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
