export function formatMoney(amount: number, currency = "IRR"): string {
  return new Intl.NumberFormat("fa-IR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseMoney(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return Number.parseInt(digits || "0", 10);
}
