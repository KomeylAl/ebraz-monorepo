import {
  sendMultiSmsSchema,
  sendSingleSmsSchema,
  type SendMultiSmsInput,
  type SendSingleSmsInput,
} from "@ebraz/validation/sms";
import { isErrorResponse, parseBody } from "@/lib/http/parse-body";
import { success } from "@/lib/http/response";
import { withPermission } from "@/lib/http/with-auth";
import {
  sendMultiSmsMessage,
  sendSingleSmsMessage,
} from "../application/sms.service";
import { handleSmsError } from "../domain/sms-error.handler";

export const sendSingleSmsHandler = withPermission("appointments.write", async (request) => {
  const input = await parseBody<SendSingleSmsInput>(request, sendSingleSmsSchema);
  if (isErrorResponse(input)) return input;
  try {
    return success(await sendSingleSmsMessage(input));
  } catch (err) {
    return handleSmsError(err);
  }
});

export const sendMultiSmsHandler = withPermission("appointments.write", async (request) => {
  const input = await parseBody<SendMultiSmsInput>(request, sendMultiSmsSchema);
  if (isErrorResponse(input)) return input;
  try {
    return success(await sendMultiSmsMessage(input));
  } catch (err) {
    return handleSmsError(err);
  }
});
