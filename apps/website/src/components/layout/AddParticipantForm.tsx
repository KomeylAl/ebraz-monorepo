"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workshopParticipantSchema } from "@/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useState } from "react";

interface AddWorkshopParticipantFormProps {
  onCloseModal: () => void;
  workshopId: string;
}

type FormData = yup.InferType<typeof workshopParticipantSchema>;

const AddParticipantForm = ({
  onCloseModal,
  workshopId,
}: AddWorkshopParticipantFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(workshopParticipantSchema),
    defaultValues: {
      approved: false,
      gender: "", // مقدار پیش‌فرض برای gender
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      setIsPending(true);
      const res = await fetch(`/api/workshops/${workshopId}/participants`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error("خطا در ارسال اطلاعات");
      } else {
        onCloseModal();
        toast.success(
          "درخواست شما با موفقیت ثبت شد. همکاران ما به زودی با شما تماس خواهند گرفت."
        );
      }
    } catch (err) {
      console.log(err);
    }
    setIsPending(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full h-full p-8 space-y-7"
      dir="rtl"
    >
      <h2 className="text-xl font-semibold">ثبت نام در کارگاه</h2>

      <div className="w-full">
        <label className="block text-sm font-medium">نام و نام خانوادگی</label>
        <Input
          {...register("name")}
          className="w-full bg-white py-2 rounded-md px-2 mt-2"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium">نام انگلیسی</label>
        <Input
          {...register("name_en")}
          className="w-full bg-white py-2 rounded-md px-2 mt-2"
        />
        {errors.name_en && (
          <p className="text-red-500 text-sm mt-1">{errors.name_en.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <div className="w-full">
          <label className="block text-sm font-medium">تلفن</label>
          <Input
            {...register("phone")}
            className="w-full bg-white py-2 rounded-md px-2 mt-2"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium">کد ملی</label>
          <Input
            {...register("national_code")}
            className="w-full bg-white py-2 rounded-md px-2 mt-2"
          />
          {errors.national_code && (
            <p className="text-red-500 text-sm mt-1">
              {errors.national_code.message}
            </p>
          )}
        </div>
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium">جنسیت</label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select
              dir="rtl"
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger className="w-[180px] text-right">
                <SelectValue placeholder="جنسیت را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent className="z-1000">
                <SelectItem value="male" className="text-right">
                  مرد
                </SelectItem>
                <SelectItem value="female" className="text-right">
                  زن
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.gender && (
          <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-5">
        <Button variant="outline" onClick={onCloseModal} type="button">
          بازگشت
        </Button>
        <Button
          type="submit"
          className={`${isPending ? "bg-blue-400" : "bg-blue-600"} text-white`}
          disabled={isPending}
        >
          {isPending ? "در حال ثبت..." : "ثبت نام"}
        </Button>
      </div>
    </form>
  );
};

export default AddParticipantForm;
