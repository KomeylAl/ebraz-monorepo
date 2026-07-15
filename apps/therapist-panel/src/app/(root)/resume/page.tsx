"use client";

import ErrorComponent from "@/components/layout/ErrorComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetResume, useSaveResume } from "@/hooks/useResume";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { PuffLoader } from "react-spinners";
import { Trash2 } from "lucide-react";
import Header from "@/components/layout/Header";
import RichTextEditor from "@/components/common/rich-text-editor";
import { Label } from "@/components/ui/label";

const DoctorResume = ({ doctorId }: { doctorId: string }) => {
  const { data: resume, isLoading, error, refetch } = useGetResume();

  const { mutate: saveResume, isPending } = useSaveResume(() => {});

  const { register, control, setValue, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (resume)
      reset({
        title: resume?.title ?? "",
        bio: resume?.bio ?? "",
        specialization: resume?.specialization ?? "",
        educations: resume?.educations ?? [
          { degree: "", institution: "", year: "" },
        ],
        experiences: resume?.experiences ?? [
          { role: "", organization: "", from: "", to: "" },
        ],
        content: resume?.content,
        skills: resume?.skills ?? [""],
        certifications: resume?.certifications ?? [""],
        social_links: resume?.social_links ?? {
          linkedin: "",
          instagram: "",
          website: "",
          twitter: "",
        },
      });
  }, [resume, reset]);

  
  const {
    fields: eduFields,
    append: addEdu,
    remove: removeEdu,
  } = useFieldArray({
    control,
    name: "educations",
  });
  
  const {
    fields: expFields,
    append: addExp,
    remove: removeExp,
  } = useFieldArray({
    control,
    name: "experiences",
  });
  
  const [content, setContent] = useState("");
  const onSubmit = (data: any) => {
    if (typeof data.skills === "string") {
      // اگر کاربر فقط یه رشته وارد کرده (با کاما جدا)
      data.skills = data.skills
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    } else if (
      Array.isArray(data.skills) &&
      typeof data.skills[0] === "string"
    ) {
      // اگر اولین المان یه رشته باشه
      data.skills = data.skills
        .flatMap((s: string) => s.split(","))
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    saveResume({ formData: data, doctorId });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Header searchFn={() => {}} isShowSearch={false} />
      <div className="w-full flex flex-col p-6">
        <div className="w-full">
          {isLoading && (
            <div className="w-full h-full flex items-center justify-center">
              <PuffLoader size={60} color="#3e86fa" />
            </div>
          )}
          {error && <ErrorComponent refetch={refetch} />}
          {resume && (
            <div className="w-full space-y-3 p-2">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 w-full mx-auto"
              >
                <h2 className="text-xl font-bold">ویرایش رزومه</h2>

                <h3 className="mt-4 font-semibold">عنوان</h3>
                <Input
                  {...register("title")}
                  placeholder="عنوان"
                  className="bg-white"
                />
                <p className="text-sm">
                  این بخش صرفا برای درک بهتر موتور های جستجو از رزومه شماست و به
                  کاربران عادی نمایش داده نمیشود.
                </p>

                <h3 className="mt-4 font-semibold">معرفی کوتاه</h3>
                <Textarea
                  {...register("bio")}
                  placeholder="توضیحات"
                  className="bg-white"
                />
                <p className="text-sm">
                  این بخش صرفا برای درک بهتر موتور های جستجو از رزومه شماست و به
                  کاربران عادی نمایش داده نمیشود.
                </p>

                <h3 className="mt-4 font-semibold">تخصص اصلی</h3>
                <Textarea
                  {...register("specialization")}
                  placeholder="تخصص اصلی"
                  className="bg-white"
                />

                {/* تحصیلات */}
                <h3 className="font-semibold mt-4">تحصیلات</h3>
                <div className="space-y-2">
                  {eduFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-md relative"
                    >
                      <Input
                        {...register(`educations.${index}.degree`)}
                        placeholder="مدرک"
                        className="bg-white"
                      />
                      <Input
                        {...register(`educations.${index}.institution`)}
                        placeholder="دانشگاه"
                        className="bg-white"
                      />
                      <Input
                        {...register(`educations.${index}.year`)}
                        placeholder="سال"
                        className="bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeEdu(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      addEdu({ degree: "", institution: "", year: "" })
                    }
                    className="text-blue-600 hover:underline mt-1"
                  >
                    + افزودن مورد جدید
                  </button>
                </div>

                {/* رزومه */}
                <h3 className="font-semibold mt-4">رزومه</h3>
                <div>
                  <RichTextEditor
                    content={resume?.content ?? ""}
                    onChange={(val) => {
                      setContent(val);
                      setValue("content", val);
                    }}
                  />
                </div>

                {/* سوابق کاری */}
                {/* <h3 className="font-semibold mt-4">سوابق کاری</h3>
                <div className="space-y-2">
                  {expFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-md relative"
                    >
                      <Input
                        {...register(`experiences.${index}.role`)}
                        placeholder="سمت"
                        className="bg-white"
                      />
                      <Input
                        {...register(`experiences.${index}.organization`)}
                        placeholder="محل کار"
                        className="bg-white"
                      />
                      <Input
                        {...register(`experiences.${index}.from`)}
                        placeholder="از سال"
                        className="bg-white"
                      />
                      <Input
                        {...register(`experiences.${index}.to`)}
                        placeholder="تا سال"
                        className="bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeExp(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      addExp({ role: "", organization: "", from: "", to: "" })
                    }
                    className="text-blue-600 hover:underline mt-1"
                  >
                    + افزودن سابقه جدید
                  </button>
                </div> */}

                {/* رویکرد ها */}
                <h3 className="font-semibold mt-4">
                  رویکرد های درمان / مشاوره
                </h3>
                <Input
                  {...register("skills")}
                  placeholder="مثلاً CBT, ACT, Mindfulness"
                  className="bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  رویکرد را با ویرگول جدا کنید.
                </p>

                {/* لینک‌ها */}
                <h3 className="font-semibold mt-4">لینک‌ها</h3>
                <Label className="mt-4">لینکداین</Label>
                <Input
                  {...register("social_links.linkedin")}
                  placeholder="LinkedIn URL"
                  className="bg-white"
                />

                <Label className="mt-4">توییتر (X)</Label>
                <Input
                  {...register("social_links.twitter")}
                  placeholder="Twitter URL"
                  className="bg-white"
                />

                <Label className="mt-4">اینستاگرام</Label>
                <Input
                  {...register("social_links.instagram")}
                  placeholder="Instagram URL"
                  className="bg-white"
                />

                <Label className="mt-4">وبسایت شخصی</Label>
                <Input
                  {...register("social_links.website")}
                  placeholder="Website URL"
                  className="bg-white"
                />

                <Button type="submit" disabled={isPending} className="mt-4">
                  ذخیره رزومه
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorResume;
