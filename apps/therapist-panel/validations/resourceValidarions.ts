import * as yup from "yup";

export const resourceSchema = yup.object({
  title: yup.string().required("عنوان الزامی است"),
  type: yup
    .mixed<"link" | "file">()
    .oneOf(["link", "file"], "نوع منبع معتبر نیست")
    .required("انتخاب نوع منبع الزامی است"),
  description: yup.string().nullable(),
  link: yup.string().when("type", {
    is: "link",
    then: (schema) => schema.required("لینک الزامی است").url("لینک معتبر نیست"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  file: yup.mixed<File>().when("type", {
    is: "file",
    then: (schema) => schema.notRequired().nullable(),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});

export function createResourceSchema(requireFile: boolean) {
  return resourceSchema.shape({
    file: yup.mixed<File>().when("type", {
      is: "file",
      then: (schema) =>
        requireFile
          ? schema.required("فایل الزامی است")
          : schema.notRequired().nullable(),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  });
}
