"use client";

import React from "react";
import Header from "@/components/layout/Header";
import OnlineAppointment from "@/components/layout/OnlineAppointment";

const Appointment = () => {
  return (
    <div>
      <Header pageTitle="دریافت نوبت" />
      <div className="w-full px-5 md:px-24 lg:px-48 py-12 space-y-6 flex flex-col items-center">
        <h2 className="text-3xl font-semibold">دریافت نوبت کلینیک ابراز</h2>
        <p>برای دریافت نویت میتوانید یکی از شیوه های زیر را انتخاب کنید.</p>
        <div className="w-full text-center flex flex-col items-center justify-center gap-4 mt-8">
          <div className="w-12 h-12 bg-black/85 rounded-full flex items-center justify-center text-beige text-2xl font-semibold">
            1
          </div>
          <p className="text-lg">تماس با یکی از شماره های:</p>
          <p className="text-xl">
            03191095184 - 03191093136 - 03136680262 - 03136680290
          </p>
          <p className="text-lg">و دریافت نوبت به صورت تلفنی.</p>
          <div className="w-12 h-12 bg-black/85 rounded-full flex items-center justify-center text-beige text-2xl font-semibold mt-6">
            2
          </div>
          <p className="text-lg">دریافت نوبت ارزیابی اولیه رایگان</p>
          <OnlineAppointment />
        </div>
      </div>
    </div>
  );
};

export default Appointment;
