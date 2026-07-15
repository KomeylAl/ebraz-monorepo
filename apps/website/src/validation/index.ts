import * as yup from "yup";

import { adminSchema } from "./adminsValidations";
import { assessmentSchema } from "./assessmentsValidations";

export const workshopSchema = yup.object().shape({
  title: yup.string().required("عنوان الزامی است"),
  slug: yup.string().required("اسلاگ الزامی است"),
  organizers: yup.string().required("برگزار کنندگان الزامی است"),
  excerpt: yup.string().required("خلاصه الزامی است"),
  content: yup.string().required("محتوا الزامی است"),
  start_date: yup.string().nullable(),
  end_date: yup.string().nullable(),
  week_day: yup.string().nullable(),
  time: yup.string().nullable(),
  image: yup.mixed().nullable(),
});

export const workshopSessionSchema = yup.object().shape({
  title: yup.string().required("عنوان الزامی است"),
  description: yup.string().required("توضیحات الزامی است"),
  start_time: yup.string().required("زمان شروع الزامی است"),
  end_time: yup.string().required("زمان پایان الزامی است"),
  session_date: yup.string().required("تاریخ برگزاری الزامی است"),
  location: yup.string().nullable(),
  link: yup.string().nullable(),
});

export const workshopParticipantSchema = yup.object().shape({
  name: yup.string().required("نام الزامی است"),
  name_en: yup.string().required("نام انگلیسی الزامی است"),
  phone: yup
    .string()
    .required("تلفن الزامی است")
    .max(15, "تلفن نمیتواند بیشتر از 15 رقم باشد"),
  national_code: yup
    .string()
    .required("کد ملی الزامی است")
    .min(10, "کد ملی حدقا باید 10 رقم باشد")
    .max(10, "کد ملی نمیتواند بیشتر از 10 رقم باشد."),
  gender: yup.string().required("جنسیت الزامی است"),
  approved: yup.boolean().nullable(),
});

export const categorySchema = yup.object().shape({
  name: yup.string().required("نام الزامی است"),
  slug: yup.string().required("اسلاگ الزامی است"),
  content: yup.string().required("محتوا الزامی است"),
  excerpt: yup.string().nullable(),
  image: yup.mixed().nullable(),
});

export const tagSchema = yup.object().shape({
  name: yup.string().required("نام الزامی است"),
  slug: yup.string().required("اسلاگ الزامی است"),
  content: yup.string().required("محتوا الزامی است"),
  excerpt: yup.string().nullable(),
  image: yup.mixed().nullable(),
});

export const postSchema = yup.object().shape({
  title: yup.string().required("عنوان الزامی است"),
  slug: yup.string().required("اسلاگ الزامی است"),
  content: yup.string().required("محتوا الزامی است"),
  excerpt: yup.string().nullable(),
  status: yup.string().nullable().default("draft"),
  published_at: yup.string().nullable().default(null),
  category_id: yup.string().required("دسته بندی الزامی است"),
  tag_ids: yup.array().nullable(),
  thumbnail: yup.mixed().nullable(),
});

export const departmentSchema = yup.object().shape({
  title: yup.string().required("عنوان الزامی است"),
  slug: yup.string().required("اسلاگ الزامی است"),
  content: yup.string().required("محتوا الزامی است"),
  excerpt: yup.string().nullable(),
  thumbnail: yup.mixed().nullable(),
});

export const doctorSchema = yup.object().shape({
  name: yup.string().required("نام الزامی است"),
  phone: yup.string().required("تلفن الزامی است"),
  card_number: yup.string().required("شماره کارت الزامی است"),
  birth_date: yup.string().required("تاریخ تولد الزامی است"),
  national_code: yup.string().required("کد ملی الزامی است"),
  medical_number: yup.string().required("شماره نظام روانشناسی الزامی است"),
  email: yup.string().email().required("ایمیل الزامی است"),
  days: yup.string().nullable(),
  department_ids: yup.array().nullable(),
  avatar: yup.mixed().nullable(),
  resume: yup.mixed().nullable(),
});

export {
  adminSchema,
  assessmentSchema
}
