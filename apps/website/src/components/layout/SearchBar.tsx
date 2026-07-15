"use client";

import React from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { CiSearch } from "react-icons/ci";

const SearchBar = ({ className }: { className?: string }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (serachTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (serachTerm) {
      params.set("query", serachTerm);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      className={`${className} w-1/2 bg-white border border-gray-200 rounded-md flex items-center gap-1 px-3`}
    >
      <CiSearch />
      <Input
        defaultValue={searchParams.get("query") || ""}
        placeholder="جستجو..."
        className="w-full border-none ring-0 outline-none focus:outline-none focus:ring-0 shadow-none focus-visible:ring-0"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
      />
    </div>
  );
};

export default SearchBar;
