const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const longDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/St_Thomas",
});

export function money(value: number | null | undefined, approximate = false): string {
  if (value == null) return "—";
  const formatted = currency.format(value);
  return approximate ? `~${formatted}` : formatted;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return longDate.format(new Date(Date.UTC(year, month - 1, day)));
}

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function daysUntil(iso: string, asOfIso: string): number {
  const asOf = parseIsoDate(asOfIso).getTime();
  const target = parseIsoDate(iso).getTime();
  return Math.round((target - asOf) / 86_400_000);
}

export function daysSince(iso: string, asOfIso: string): number {
  return -daysUntil(iso, asOfIso);
}

export function invoiceLabel(fieldworkNumbers: string[], fallback: string): string {
  if (fieldworkNumbers.length === 0) return fallback;
  return fieldworkNumbers.map((n) => `Inv ${n}`).join(" + ");
}
