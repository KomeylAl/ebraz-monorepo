import { z } from "zod";
import { phoneSchema } from "../common/index";

export const sendSingleSmsSchema = z.object({
  phone: phoneSchema,
  text: z.string().min(1, "متن پیامک الزامی است"),
});

export const sendMultiSmsSchema = z.object({
  phones: z.array(phoneSchema).min(1, "حداقل یک شماره الزامی است"),
  text: z.string().min(1, "متن پیامک الزامی است"),
});

export type SendSingleSmsInput = z.infer<typeof sendSingleSmsSchema>;
export type SendMultiSmsInput = z.infer<typeof sendMultiSmsSchema>;
