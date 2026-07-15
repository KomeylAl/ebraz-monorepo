export interface SmsSendResult {
  status: number;
  message: string;
  placeholder?: boolean;
  providerResponse?: unknown;
}
