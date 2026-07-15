import React from "react";
import Link from "next/link";

interface HeaderProps {
  pageTitle: string;
  bread?: string;
  breadLink?: string;
}

const Header = ({ pageTitle, bread, breadLink }: HeaderProps) => {
  return (
    <div className="w-full h-80 hero">
      <div className="w-full h-80 pt-24 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center space-y-5">
        <h1 className="text-3xl text-beige font-bold">{pageTitle}</h1>
        <p className="text-shelfish">
          <Link href="/" className="hover:text-beige transition duration-300">خانه</Link>{" "}
          {breadLink && <Link href={breadLink}>/ {bread}</Link>} / {pageTitle}
        </p>
      </div>
    </div>
  );
};

export default Header;
