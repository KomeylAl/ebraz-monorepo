import { z } from "zod";
import { phoneSchema } from "../common/index";

export const companionInputSchema = z.object({
  name: z.string().min(2, "نام همراه الزامی است"),
  phone: phoneSchema,
  birthDate: z.coerce
    .date({ invalid_type_error: "تاریخ تولد معتبر نیست" })
    .optional(),
  address: z.string().optional(),
});

export const upsertMedicalRecordSchema = z.object({
  recordNumber: z.string().min(1, "شماره پرونده الزامی است"),
  therapistId: z.string().optional(),
  supervisorId: z.string().optional(),
  adminId: z.string().optional(),
  referenceSource: z.string().optional(),
  admissionDate: z.coerce.date({ invalid_type_error: "تاریخ پذیرش معتبر نیست" }),
  visitDate: z.coerce.date({ invalid_type_error: "تاریخ مراجعه معتبر نیست" }),
  chiefComplaints: z.string().optional(),
  presentIllness: z.string().optional(),
  pastHistory: z.string().optional(),
  familyHistory: z.string().optional(),
  personalHistory: z.string().optional(),
  mse: z.string().optional(),
  diagnosis: z.string().optional(),
  companion: companionInputSchema.optional(),
  imagePaths: z.array(z.string().min(1)).optional(),
});

export type CompanionInput = z.infer<typeof companionInputSchema>;
export type UpsertMedicalRecordInput = z.infer<typeof upsertMedicalRecordSchema>;
