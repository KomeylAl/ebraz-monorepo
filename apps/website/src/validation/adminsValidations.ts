import * as yup from "yup";

export const adminSchema = yup.object().shape({
  name: yup.string().required("نام الزامی است"),
  phone: yup.string().required("تلفن الزامی است"),
  birth_date: yup.string().required("تاریخ تولد الزامی است"),
  role: yup.string().required("نفش الزامی است"),
  password: yup.string().required("رمز عبور الزامی است"),
});
