import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LaneChip } from "@/components/status-chip";
import {
  AGING_LABEL,
  LANE_LABEL,
  LANE_ORDER,
  agingTotals,
  getBlocker,
  getPurchaseOrder,
  isActiveChase,
  nextOpenStep,
  seed,
  sortByUrgency,
  steveMustDo,
  sumAmounts,
  uniqueAgencies,
} from "@/lib/ar";
import { invoiceLabel, money } from "@/lib/format";
import type { AgingBucket, Invoice, InvoiceLane } from "@/lib/types";

const agingKeys: AgingBucket[] = ["current", "30", "60", "90+", "unaged"];

function filterHref(lane: InvoiceLane | "all", agency: string) {
  const query = new URLSearchParams();
  if (lane !== "all") query.set("lane", lane);
  if (agency !== "all") query.set("agency", agency);
  const qs = query.toString();
  return qs ? `/?${qs}#chase-list` : "/#chase-list";
}

export function Dashboard({
  lane = "all",
  agency = "all",
}: {
  lane?: InvoiceLane | "all";
  agency?: string;
}) {
  const invoices = sortByUrgency(seed.invoices).filter((invoice) => {
    if (agency !== "all" && invoice.agency !== agency) return false;
    if (lane !== "all" && invoice.lane !== lane) return false;
    return true;
  });

  const active = seed.invoices.filter(isActiveChase);
  const verify = seed.invoices.filter((invoice) => invoice.lane === "verify");
  const hold = seed.invoices.filter((invoice) => invoice.lane === "hold");
  const activeSum = sumAmounts(active);
  const verifySum = sumAmounts(verify);
  const aging = agingTotals(active);
  const agencies = uniqueAgencies();
  const actions = steveMustDo();

  const byAgencyMap = new Map<string, Invoice[]>();
  for (const invoice of seed.invoices) {
    const list = byAgencyMap.get(invoice.agency) ?? [];
    list.push(invoice);
    byAgencyMap.set(invoice.agency, list);
  }
  const byAgency = [...byAgencyMap.entries()].sort((a, b) => {
    const aActive = sumAmounts(a[1].filter(isActiveChase)).total;
    const bActive = sumAmounts(b[1].filter(isActiveChase)).total;
    return bActive - aActive || a[0].localeCompare(b[0]);
  });

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0f2744]">
            Outstanding government invoices
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Snapshot {seed.asOf}. Goal is a check, not a new bid. Workflow: acknowledge
            the PO → create the GVI Buy invoice → attach a clean Fieldwork PDF → submit →
            track receipt to payment. Amounts below are only what was recorded in session
            — nothing else was invented.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Active chase"
            value={money(activeSum.total, activeSum.approximate)}
            hint={`${active.filter((i) => i.amount != null).length} invoices · upload + in portal`}
            tone="red"
          />
          <SummaryCard
            label="Verify before chase"
            value={money(verifySum.total)}
            hint={`${verify.length} Closed / Complete Receipt · confirm unpaid first`}
            tone="amber"
          />
          <SummaryCard
            label="Hold — do not invoice"
            value={`${hold.length} items`}
            hint="PO :36 unreconciled · StJ CC waiting · Winston scheduled"
            tone="slate"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-[#0f2744] uppercase">
          Aging (active chase only)
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {agingKeys.map((key) => (
            <Card key={key} size="sm" className="bg-white">
              <CardHeader>
                <CardDescription>{AGING_LABEL[key]}</CardDescription>
                <CardTitle className="text-xl tabular-nums">
                  {money(aging[key].total, aging[key].approximate)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {aging[key].count} invoice{aging[key].count === 1 ? "" : "s"}
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Fieldwork invoice dates were not in the 2026-09-20 notes, so every active row
          sits in Date unknown. Add <code className="rounded bg-muted px-1">invoiceDate</code>{" "}
          (YYYY-MM-DD) on each invoice in <code className="rounded bg-muted px-1">src/data/seed.json</code>{" "}
          and these buckets will fill.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-[#0f2744] uppercase">
          By agency
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {byAgency.map(([name, rows]) => {
            const chase = rows.filter(isActiveChase);
            const sum = sumAmounts(chase);
            const pos = [...new Set(rows.map((row) => row.poId))];
            return (
              <Card key={name} className="bg-white">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{name}</CardTitle>
                      <CardDescription>
                        {pos.length} PO{pos.length === 1 ? "" : "s"} · {rows.length} row
                        {rows.length === 1 ? "" : "s"}
                      </CardDescription>
                    </div>
                    <p className="text-right text-base font-semibold tabular-nums text-[#0f2744]">
                      {sum.knownCount ? money(sum.total, sum.approximate) : "—"}
                      <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                        active chase
                      </span>
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rows.map((invoice) => {
                    const po = getPurchaseOrder(invoice.poId);
                    return (
                      <Link
                        key={invoice.id}
                        href={`/invoice/${invoice.id}`}
                        className="flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm hover:bg-muted/60"
                      >
                        <div className="min-w-0">
                          <p className="font-medium">
                            {invoiceLabel(invoice.fieldworkNumbers, invoice.site || invoice.id)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {po?.number} · {invoice.portalStatus}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="tabular-nums">{money(invoice.amount, invoice.amountIsApproximate)}</p>
                          <LaneChip lane={invoice.lane} />
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-[#0f2744] uppercase">
            Steve / Chewie still need to
          </h2>
          <p className="text-sm text-muted-foreground">
            Next action on every open row, plus payment-file gaps that can stop a check.
          </p>
        </div>
        <ol className="divide-y rounded-xl bg-white ring-1 ring-foreground/10">
          {actions.map((item, index) => (
            <li key={`${item.href}-${item.title}-${index}`}>
              <Link
                href={item.href}
                className="flex gap-3 px-4 py-3 hover:bg-muted/50"
              >
                <span className="w-6 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-[#0f2744]">{item.title}</span>
                  <span className="block text-sm text-muted-foreground">{item.detail}</span>
                </span>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                  {item.tone === "prereq" ? "Prerequisite" : LANE_LABEL[item.tone]}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section id="chase-list" className="scroll-mt-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-[#0f2744] uppercase">
              Chase list
            </h2>
            <p className="text-sm text-muted-foreground">
              Sorted expired-path first: upload → in portal → verify → hold.
              Agency cards above stay complete; only this list filters.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by lane">
            <FilterLink
              href={filterHref("all", agency)}
              active={lane === "all"}
              label="All lanes"
            />
            {LANE_ORDER.map((key) => (
              <FilterLink
                key={key}
                href={filterHref(key, agency)}
                active={lane === key}
                label={LANE_LABEL[key]}
              />
            ))}
          </div>
        </div>
        <p className="text-sm font-medium text-[#0f2744]">
          Showing {invoices.length} of {seed.invoices.length}
          {lane === "all" ? "" : ` · ${LANE_LABEL[lane]}`}
          {agency === "all" ? "" : ` · ${agency}`}
        </p>
        <div className="flex flex-wrap gap-2">
          <FilterLink
            href={filterHref(lane, "all")}
            active={agency === "all"}
            label="All agencies"
          />
          {agencies.map((name) => (
            <FilterLink
              key={name}
              href={filterHref(lane, name)}
              active={agency === name}
              label={name}
            />
          ))}
        </div>

        {invoices.length === 0 ? (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>No invoices in this filter</CardTitle>
              <CardDescription>
                Clear the agency or lane filter, or add a row to seed.json.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="hidden md:block rounded-xl bg-white ring-1 ring-foreground/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>PO</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Lane</TableHead>
                    <TableHead>Next blocker</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const po = getPurchaseOrder(invoice.poId);
                    const next = nextOpenStep(invoice);
                    const blocker = invoice.blockers[0]
                      ? getBlocker(invoice.blockers[0])
                      : undefined;
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="whitespace-normal">
                          <Link
                            href={`/invoice/${invoice.id}`}
                            className="font-medium text-[#0f2744] underline-offset-2 hover:underline"
                          >
                            {invoiceLabel(
                              invoice.fieldworkNumbers,
                              invoice.fieldworkNote || invoice.id,
                            )}
                          </Link>
                          {invoice.doNotRecreate ? (
                            <p className="text-xs text-amber-800">Do not re-create in portal</p>
                          ) : null}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {invoice.agency}
                          {invoice.site ? (
                            <span className="block text-xs text-muted-foreground">
                              {invoice.site}
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {po ? (
                            <Link
                              href={`/po/${po.id}`}
                              className="underline-offset-2 hover:underline"
                            >
                              {po.number}
                            </Link>
                          ) : (
                            invoice.poId
                          )}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {money(invoice.amount, invoice.amountIsApproximate)}
                        </TableCell>
                        <TableCell>
                          <LaneChip lane={invoice.lane} />
                        </TableCell>
                        <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                          {blocker?.label || next?.label || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 md:hidden">
              {invoices.map((invoice) => {
                const po = getPurchaseOrder(invoice.poId);
                const blocker = invoice.blockers[0]
                  ? getBlocker(invoice.blockers[0])
                  : undefined;
                return (
                  <Link key={invoice.id} href={`/invoice/${invoice.id}`}>
                    <Card className="bg-white">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle>
                            {invoiceLabel(
                              invoice.fieldworkNumbers,
                              invoice.fieldworkNote || invoice.id,
                            )}
                          </CardTitle>
                          <LaneChip lane={invoice.lane} />
                        </div>
                        <CardDescription>
                          {invoice.agency}
                          {invoice.site ? ` · ${invoice.site}` : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        <p className="font-semibold tabular-nums">
                          {money(invoice.amount, invoice.amountIsApproximate)}
                        </p>
                        <p className="text-muted-foreground">{po?.number}</p>
                        <p className="text-muted-foreground">
                          {blocker?.label || invoice.portalStatus}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "red" | "amber" | "slate";
}) {
  const bar =
    tone === "red"
      ? "border-l-4 border-l-red-600"
      : tone === "amber"
        ? "border-l-4 border-l-amber-500"
        : "border-l-4 border-l-slate-400";
  return (
    <Card className={`bg-white ${bar}`}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>
    </Card>
  );
}

function FilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "inline-flex h-7 items-center rounded-md bg-[#0f2744] px-2.5 text-[0.8rem] font-medium text-white"
          : "inline-flex h-7 items-center rounded-md border border-border bg-white px-2.5 text-[0.8rem] font-medium text-foreground hover:bg-muted"
      }
    >
      {label}
    </Link>
  );
}
