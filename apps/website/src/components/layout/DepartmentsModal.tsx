"use client";

import { useModal } from "@/hooks/useModal";
import React from "react";
import { Button } from "../ui/button";
import { GraphCanvas } from "reagraph";
import DepartmentsGraph from "./DepartmentsGraph";

const DepartmentsModal = () => {
  const { isOpen, openModal, closeModal } = useModal();
  return (
    <>
      <Button onClick={openModal}>مشاهده گراف دپارتمان ها</Button>
      <div
        className={`${
          isOpen ? "flex" : "hidden"
        } bg-shelfish w-full min-h-screen transition-all duration-300 fixed inset-0 z-1000 no-scrollbar`}
      >
        <Button className="absolute top-3 right-3 z-2000" onClick={closeModal}>
          خروج
        </Button>
        <DepartmentsGraph />
      </div>
    </>
  );
};

export default DepartmentsModal;
