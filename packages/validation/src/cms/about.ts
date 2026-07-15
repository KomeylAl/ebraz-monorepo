import { z } from "zod";

export const upsertAboutSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  about: z.string().min(1, "متن درباره ما الزامی است"),
  address: z.string().min(1, "آدرس الزامی است"),
  phones: z.string().min(1, "تلفن الزامی است"),
  mobilePhones: z.string().min(1, "موبایل الزامی است"),
  logoPath: z.string().min(1, "لوگو الزامی است"),
  lat: z.string().min(1, "عرض جغرافیایی الزامی است"),
  longitude: z.string().min(1, "طول جغرافیایی الزامی است"),
});

export type UpsertAboutInput = z.infer<typeof upsertAboutSchema>;
