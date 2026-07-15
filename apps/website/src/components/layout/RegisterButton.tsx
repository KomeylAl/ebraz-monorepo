"use client";

import { useModal } from "@/hooks/useModal";
import React from "react";
import { Modal } from "../common/Modal";
import AddParticipantForm from "./AddParticipantForm";

const RegisterButton = ({ id }: { id: string }) => {
  const { isOpen, openModal, closeModal } = useModal();
  return (
    <>
      <button
        onClick={openModal}
        className="w-full px-4 py-2 rounded-md border border-primary text-primary cursor-pointer hover:bg-beige hover:text-black transition duration-300"
      >
        درخواست ثبت نام
      </button>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] bg-white"
        showCloseButton={false}
      >
        <AddParticipantForm
          onCloseModal={() => {
            closeModal();
          }}
          workshopId={id}
        />
      </Modal>
    </>
  );
};

export default RegisterButton;
