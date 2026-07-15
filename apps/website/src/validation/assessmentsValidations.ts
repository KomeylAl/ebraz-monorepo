import * as yup from "yup";

export const assessmentSchema = yup.object().shape({
  client: yup.object({
    name: yup.string().required("نام الزامی است"),
    phone: yup.string().required("تلفن الزامی است"),
  }),
  doctor_id: yup.string().optional(),
  date: yup.string().optional(),
  time: yup.string().optional(),
  status: yup.string().optional().default("pending"),
});
