"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { createResourceSchema } from "../../../../validations";
import { useCreateResource, useUpdateResource } from "@/hooks/useResources";
import type { resourceApiType, resourceType } from "@/types";
import { useEffect } from "react";

interface TherapyResourceFormProps {
  onClose: () => void;
  onSuccess: () => void;
  resource?: resourceApiType;
}

function buildFormData(data: resourceType): FormData {
  const formData = new FormData();
  formData.append("title", data.title.trim());
  formData.append("type", data.type);
  if (data.description?.trim()) {
    formData.append("description", data.description.trim());
  } else {
    formData.append("description", "");
  }

  if (data.type === "link") {
    formData.append("link", data.link?.trim() ?? "");
  }

  if (data.type === "file" && data.file instanceof File) {
    formData.append("file", data.file);
  }

  return formData;
}

const TherapyResourceForm = ({ onClose, onSuccess, resource }: TherapyResourceFormProps) => {
  const isEdit = Boolean(resource?.id);
  const hasExistingFile = Boolean(resource?.file_path || resource?.filePath);
  const schema = createResourceSchema(!hasExistingFile);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: "link" as const,
      title: "",
      description: "",
      link: "",
      file: undefined,
    },
  });

  const { mutate: createResource, isPending: isCreating } = useCreateResource(onSuccess);
  const { mutate: updateResource, isPending: isUpdating } = useUpdateResource(onSuccess);
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (!resource) return;
    reset({
      title: resource.title ?? "",
      type: (resource.type === "file" ? "file" : "link") as "link" | "file",
      description: resource.description ?? "",
      link: resource.link ?? "",
      file: undefined,
    });
  }, [resource, reset]);

  const selectedType = watch("type");

  const onSubmit = (data: resourceType) => {
    const hasExistingFile = Boolean(resource?.file_path || resource?.filePath);
    if (data.type === "file" && !(data.file instanceof File) && !hasExistingFile) {
      toast.error("فایل الزامی است");
      return;
    }

    const formData = buildFormData(data);

    if (isEdit && resource?.id) {
      updateResource({ id: resource.id, formData });
      return;
    }

    createResource(formData);
  };

  return (
    <div className="w-full p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-bold">{isEdit ? "ویرایش منبع" : "افزودن منبع جدید"}</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">عنوان</label>
          <Input
            {...register("title")}
            placeholder="مثلاً تمرین تنفس روزانه"
            className="bg-white"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">نوع منبع</label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select dir="rtl" onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full text-right bg-white">
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent className="z-1000">
                  <SelectItem value="link" className="text-right">
                    لینک
                  </SelectItem>
                  <SelectItem value="file" className="text-right">
                    فایل
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && <p className="text-red-500 text-sm">{String(errors.type.message)}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">توضیحات (اختیاری)</label>
          <Textarea
            {...register("description")}
            placeholder="توضیح کوتاه برای مراجع"
            className="bg-white"
          />
        </div>

        {selectedType === "link" && (
          <div className="space-y-1">
            <label className="text-sm font-medium">لینک</label>
            <Input
              {...register("link")}
              placeholder="https://example.com"
              className="bg-white"
            />
            {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}
          </div>
        )}

        {selectedType === "file" && (
          <div className="space-y-1">
            <label className="text-sm font-medium">فایل</label>
            {(resource?.file_path || resource?.filePath) && (
              <p className="text-xs text-slate-500 mb-2">
                فایل فعلی موجود است. در صورت نیاز فایل جدید انتخاب کنید.
              </p>
            )}
            <Controller
              name="file"
              control={control}
              render={({ field }) => (
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                  className="bg-white"
                />
              )}
            />
            {errors.file && (
              <p className="text-red-500 text-sm">{String(errors.file.message)}</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
            بازگشت
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "ذخیره منبع"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TherapyResourceForm;
