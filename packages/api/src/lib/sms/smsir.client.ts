import type { SmsSendResult } from "@ebraz/types/sms";
import { normalizePhone } from "@ebraz/utils/phone";

const SMSIR_BULK_URL = "https://api.sms.ir/v1/send/bulk";

function getLineNumber(): number {
  const raw = process.env.SMSIR_LINE_NUMBER ?? "9982005424";
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 9982005424;
}

export async function sendBulkSms(
  mobiles: string[],
  messageText: string,
): Promise<SmsSendResult> {
  const normalizedMobiles = mobiles.map((phone) => normalizePhone(phone));
  const apiKey = process.env.SMSIR_API_KEY?.trim();

  if (!apiKey) {
    console.log("[SMS placeholder]", {
      mobiles: normalizedMobiles,
      messageText,
    });
    return {
      status: 1,
      message: "SMS logged (SMSIR_API_KEY not configured)",
      placeholder: true,
    };
  }

  const response = await fetch(SMSIR_BULK_URL, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lineNumber: getLineNumber(),
      messageText,
      mobiles: normalizedMobiles,
      sendDateTime: null,
    }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("SMS API error:", data);
    return {
      status: response.status,
      message: "SMS provider request failed",
      providerResponse: data,
    };
  }

  return {
    status: 1,
    message: "SMS sent",
    providerResponse: data,
  };
}

export async function sendSingleSms(phone: string, text: string): Promise<SmsSendResult> {
  return sendBulkSms([phone], text);
}
