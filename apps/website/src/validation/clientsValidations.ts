import * as yup from "yup";

export const clientRecordSchema = yup.object({
  doctor_id: yup.number().required("لطفا پزشک را انتخاب کنید"),
  supervisor_id: yup.number().required("لطفا سوپروایزر را انتخاب کنید"),
  admin_id: yup.number().required("لطفا پذیرش کننده را انتخاب کنید"),
  record_number: yup.string().required("شماره پرونده الزامی است"),
  reference_source: yup.string(),
  admission_date: yup.string().required("تاریخ مراجعه الزامی است"),
  visit_date: yup.string().required("تاریخ ویزیت الزامی است"),
  chief_complaints: yup.string().nullable(),
  present_illness: yup.string().nullable(),
  past_history: yup.string().nullable(),
  family_history: yup.string().nullable(),
  personal_history: yup.string().nullable(),
  mse: yup.string().nullable(),
  diagnosis: yup.string().nullable(),
  companion_name: yup.string().nullable(),
  companion_phone: yup.string().nullable(),
  companion_address: yup.string().nullable(),
  images: yup
    .mixed<File[]>()
    .test("fileCount", "حداکثر 5 عکس مجاز است", (value) => {
      if (!value) return true;
      return value.length <= 5;
    })
    .test("fileSize", "حجم عکس‌ها نباید بیشتر از 1MB باشد", (value) => {
      if (!value) return true;
      return value.every((file) => file.size <= 1 * 1024 * 1024);
    }),
});
