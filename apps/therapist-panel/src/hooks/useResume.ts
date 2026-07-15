import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useGetResume() {
  return useQuery({
    queryKey: ["resume"],
    queryFn: async () => {
      const res = await fetch("/api/resume");
      if (res.status !== 200) {
        throw new Error("خطا در دریافت اطلاعات");
      }
      const json = await res.json();
      return json.data ?? json;
    },
  });
}

export function useSaveResume(onDuccess: () => void) {
  return useMutation({
    mutationFn: async ({
      formData,
    }: {
      formData: any;
      doctorId: string;
    }) => {
      const newData = new FormData();
      newData.append("title", formData.title ?? "");
      newData.append("bio", formData.bio ?? "");
      newData.append("content", formData.content ?? "");
      newData.append("specialization", formData.specialization ?? "");
      newData.append("educations", JSON.stringify(formData.educations ?? []));
      newData.append("experiences", JSON.stringify(formData.experiences ?? []));
      newData.append("skills", JSON.stringify(formData.skills ?? []));
      newData.append(
        "certifications",
        JSON.stringify(
          Array.isArray(formData.certifications)
            ? formData.certifications
            : typeof formData.certifications === "string"
              ? formData.certifications
                  .split(",")
                  .map((item: string) => item.trim())
                  .filter(Boolean)
              : [],
        ),
      );
      newData.append("social_links", JSON.stringify(formData.social_links ?? {}));

      if (formData.file && formData.file.length > 0) {
        newData.append("file", formData.file[0]);
      }

      const res = await fetch("/api/resume", {
        method: "POST",
        body: newData,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "خطا در ذخیره رزومه");
      }

      return json;
    },
    onError(error) {
      console.log(error);
      toast.error("خطا در ذخیره رزومه");
    },
    onSuccess: () => {
      toast.success("رزومه با موفقیت ذخیره شد");
      onDuccess();
    },
  });
}
