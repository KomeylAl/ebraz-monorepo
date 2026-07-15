"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { Modal } from "../Modal";
import { useModal } from "@/hooks/useModal";

const SetAppointmentButton = ({ doctorName }: { doctorName: string }) => {
  const { isOpen, openModal, closeModal } = useModal();
  return (
    <>
      <Button
        onClick={openModal}
        className="bg-primary text-beige w-full text-lg"
        size="lg"
      >
        دریافت نوبت
      </Button>
      <Modal
        showCloseButton={false}
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pl-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              دریافت نوبت {doctorName}
            </h4>
            <p>برای دریافت نویت میتوانید تماس بگیرید.</p>
            <div className="w-full text-right flex flex-col items-center justify-center gap-4 mt-8">
              <p className="text-lg">تماس با یکی از شماره های:</p>
              <p className="text-xl">
                03191095184 - 03191093136 - 03136680262 - 03136680290
              </p>
              <p className="text-lg">و دریافت نوبت به صورت تلفنی.</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SetAppointmentButton;
