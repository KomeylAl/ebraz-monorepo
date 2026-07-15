import type { SendMultiSmsInput, SendSingleSmsInput } from "@ebraz/validation/sms";
import { sendBulkSms, sendSingleSms } from "@/lib/sms";
import { SmsError } from "../domain/sms.errors";

function assertProviderSuccess(result: Awaited<ReturnType<typeof sendBulkSms>>) {
  if (result.status === 1) return;
  throw new SmsError(result.message, "PROVIDER_ERROR");
}

export async function sendSingleSmsMessage(input: SendSingleSmsInput) {
  const result = await sendSingleSms(input.phone, input.text);
  assertProviderSuccess(result);
  return result;
}

export async function sendMultiSmsMessage(input: SendMultiSmsInput) {
  const result = await sendBulkSms(input.phones, input.text);
  assertProviderSuccess(result);
  return result;
}
