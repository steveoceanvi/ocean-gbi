import seedJson from "@/data/seed.json";
import type {
  AgingBucket,
  BlockerDefinition,
  Invoice,
  InvoiceLane,
  Prerequisite,
  PrerequisiteStatus,
  PurchaseOrder,
  Seed,
} from "@/lib/types";
import { daysSince, daysUntil } from "@/lib/format";

export const seed = seedJson as Seed;

export const LANE_ORDER: InvoiceLane[] = ["upload", "in_portal", "verify", "hold"];

export const LANE_LABEL: Record<InvoiceLane, string> = {
  upload: "Upload now",
  in_portal: "In portal — chase pay",
  verify: "Verify before chase",
  hold: "Hold",
};

export const AGING_LABEL: Record<AgingBucket, string> = {
  current: "Current",
  "30": "1–30 days",
  "60": "31–60 days",
  "90+": "90+ days",
  unaged: "Date unknown",
};

const EXPIRING_DAYS = 90;

export function getInvoice(id: string): Invoice | undefined {
  return seed.invoices.find((invoice) => invoice.id === id);
}

export function getPurchaseOrder(id: string): PurchaseOrder | undefined {
  return seed.purchaseOrders.find((po) => po.id === id);
}

export function invoicesForPo(poId: string): Invoice[] {
  return seed.invoices.filter((invoice) => invoice.poId === poId);
}

export function getBlocker(id: string): BlockerDefinition | undefined {
  return seed.blockerCatalog.find((blocker) => blocker.id === id);
}

export function sortByUrgency(invoices: Invoice[]): Invoice[] {
  return [...invoices].sort((a, b) => {
    const lane = LANE_ORDER.indexOf(a.lane) - LANE_ORDER.indexOf(b.lane);
    if (lane !== 0) return lane;
    return (b.amount ?? -1) - (a.amount ?? -1);
  });
}

export function agingBucket(invoice: Invoice, asOf = seed.asOf): AgingBucket {
  if (!invoice.invoiceDate) return "unaged";
  const age = daysSince(invoice.invoiceDate, asOf);
  if (age <= 0) return "current";
  if (age <= 30) return "30";
  if (age <= 60) return "60";
  return "90+";
}

export function isActiveChase(invoice: Invoice): boolean {
  return invoice.lane === "upload" || invoice.lane === "in_portal";
}

export function sumAmounts(invoices: Invoice[]) {
  return invoices.reduce(
    (acc, invoice) => {
      if (invoice.amount == null) return acc;
      return {
        total: acc.total + invoice.amount,
        approximate: acc.approximate || invoice.amountIsApproximate,
        knownCount: acc.knownCount + 1,
      };
    },
    { total: 0, approximate: false, knownCount: 0 },
  );
}

export function agingTotals(invoices: Invoice[], asOf = seed.asOf) {
  const buckets: Record<AgingBucket, { total: number; count: number; approximate: boolean }> = {
    current: { total: 0, count: 0, approximate: false },
    "30": { total: 0, count: 0, approximate: false },
    "60": { total: 0, count: 0, approximate: false },
    "90+": { total: 0, count: 0, approximate: false },
    unaged: { total: 0, count: 0, approximate: false },
  };

  for (const invoice of invoices) {
    if (invoice.amount == null) continue;
    const bucket = agingBucket(invoice, asOf);
    buckets[bucket].total += invoice.amount;
    buckets[bucket].count += 1;
    buckets[bucket].approximate ||= invoice.amountIsApproximate;
  }

  return buckets;
}

export function uniqueAgencies(invoices: Invoice[] = seed.invoices): string[] {
  return [...new Set(invoices.map((invoice) => invoice.agency))];
}

export function resolvePrerequisiteStatus(
  item: Prerequisite,
  asOf = seed.asOf,
): PrerequisiteStatus {
  if (item.status === "missing") return "missing";
  if (!item.expirationDate) return item.status;
  const remaining = daysUntil(item.expirationDate, asOf);
  if (remaining < 0) return "expired";
  if (remaining <= EXPIRING_DAYS) return "expiring";
  return "current";
}

export function nextOpenStep(invoice: Invoice) {
  return invoice.chaseSteps.find(
    (step) => step.state === "todo" || step.state === "blocked" || step.state === "verify",
  );
}

export function steveMustDo() {
  const rows: {
    title: string;
    href: string;
    detail: string;
    tone: InvoiceLane | "prereq";
  }[] = [];

  for (const invoice of sortByUrgency(seed.invoices)) {
    if (invoice.lane === "hold") {
      rows.push({
        title: `${invoice.agency}${invoice.site ? ` · ${invoice.site}` : ""} — HOLD`,
        href: `/invoice/${invoice.id}`,
        detail: invoice.notes,
        tone: "hold",
      });
      continue;
    }

    const next = nextOpenStep(invoice);
    if (!next) continue;
    const invRef = invoice.fieldworkNumbers.length
      ? invoice.fieldworkNumbers.map((n) => `Inv ${n}`).join(", ")
      : invoice.fieldworkNote || invoice.id;
    rows.push({
      title: `${invoice.agency} · ${invRef}`,
      href: `/invoice/${invoice.id}`,
      detail: next.detail || next.label,
      tone: invoice.lane,
    });
  }

  for (const prereq of seed.prerequisites) {
    if (prereq.actionNeeded) {
      rows.push({
        title: prereq.title,
        href: "/prerequisites",
        detail: prereq.actionNeeded,
        tone: "prereq",
      });
    }
  }

  return rows;
}
