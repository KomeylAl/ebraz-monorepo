import { z } from "zod";
import { paginationSchema } from "../common/index";

export const notificationTypeSchema = z.enum(["system", "reminder", "appointment", "message"]);
export const notificationPrioritySchema = z.enum(["low", "medium", "high"]);
export const notificationTargetRoleSchema = z.enum(["ADMIN", "THERAPIST", "CLIENT"]);

export const createNotificationSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  message: z.string().optional(),
  type: notificationTypeSchema.optional(),
  priority: notificationPrioritySchema.optional(),
  targetRole: notificationTargetRoleSchema.nullable().optional(),
  targetId: z.string().min(1).nullable().optional(),
  meta: z.record(z.unknown()).optional(),
  scheduledAt: z.coerce.date({ invalid_type_error: "زمان‌بندی معتبر نیست" }).optional(),
});

export const listNotificationsQuerySchema = paginationSchema;

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

export function resolveDeliveryChannels(
  priority: "low" | "medium" | "high",
): string[] {
  switch (priority) {
    case "low":
      return ["in_app"];
    case "medium":
      return ["in_app", "email"];
    case "high":
      return ["in_app", "email", "sms"];
  }
}
