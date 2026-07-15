"use client";

import React from "react";
import imagee from "../../../public/images/hero1.webp";
import Image from "next/image";
import Link from "next/link";
import { useModal } from "@/hooks/useModal";
import { Modal } from "../common/Modal";
import AddParticipantForm from "./AddParticipantForm";
import TransitionLink from "../ui/TransitionLink";

interface WorkshopItemProps {
  title: string;
  organizers: string;
  image: string;
  id: string;
  day: string;
  endDate: string;
}

const WorkshopItem = ({
  title,
  organizers,
  image,
  id,
  day,
  endDate,
}: WorkshopItemProps) => {
  const { isOpen, openModal, closeModal } = useModal();
  const date = new Date(endDate);
  const now = new Date();
  return (
    <div className="w-80 h-96 group rounded-md space-y-3 relative shadow-lg overflow-hidden">
      <Image
        src={image || imagee}
        alt=""
        width={400}
        height={400}
        className="absolute w-full h-full object-cover -z-10"
      />
      <div className="w-full h-full bg-linear-to-t from-black to-transparent flex flex-col items-start justify-end space-y-3 p-4 relative">
        <div
          className={`absolute w-48 h-10 ${
            date < now
              ? "bg-primary text-shelfish"
              : "bg-beige/80 backdrop-blur-sm text-zinc-900"
          } top-5 -right-15 rotate-45 flex items-center justify-center`}
        >
          {date < now ? "برگزار شده" : "در حال برگزاری"}
        </div>
        <p className="text-lg font-semibold text-white hover:text-beige">
          <Link href={`/workshops/${id}`}>{title}</Link>
        </p>
        <p className="text-sm text-white text-right">{organizers}</p>
        <p className="text-sm text-white text-right">{day}</p>
        {date < now ? (
          <div className="w-full px-4 py-2 rounded-md border border-beige text-beige text-center hover:bg-beige hover:text-black transition duration-300">
            زمان ثبت نام این کارگاه به پایان رسیده است.
          </div>
        ) : (
          <button
            onClick={openModal}
            className="w-full px-4 py-2 rounded-md border border-beige text-beige cursor-pointer hover:bg-beige hover:text-black transition duration-300"
          >
            درخواست ثبت نام
          </button>
        )}
        <TransitionLink
          href={`/workshops/${id}`}
          className="w-full px-4 py-2 rounded-md border border-beige text-beige cursor-pointer hover:bg-beige hover:text-black transition duration-300 text-center"
        >
          مشاهده جزئیات
        </TransitionLink>
      </div>
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
    </div>
  );
};

export default WorkshopItem;
