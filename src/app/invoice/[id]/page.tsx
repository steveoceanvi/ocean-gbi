import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneChip, StepChip } from "@/components/status-chip";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getBlocker, getInvoice, getPurchaseOrder, invoicesForPo, seed } from "@/lib/ar";
import { invoiceLabel, money } from "@/lib/format";

export function generateStaticParams() {
  return seed.invoices.map((invoice) => ({ id: invoice.id }));
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = getInvoice(id);
  if (!invoice) notFound();

  const po = getPurchaseOrder(invoice.poId);
  const siblings = invoicesForPo(invoice.poId).filter((row) => row.id !== invoice.id);
  const openSteps = invoice.chaseSteps.filter(
    (step) => step.state === "todo" || step.state === "blocked" || step.state === "verify",
  );

  return (
    <>
      <SiteHeader current="/" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            Collections
          </Link>
          {po ? (
            <>
              {" / "}
              <Link href={`/po/${po.id}`} className="hover:underline">
                {po.number}
              </Link>
            </>
          ) : null}
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#0f2744]">
              {invoiceLabel(
                invoice.fieldworkNumbers,
                invoice.fieldworkNote || invoice.site || invoice.id,
              )}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {invoice.agency}
              {invoice.site ? ` · ${invoice.site}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <LaneChip lane={invoice.lane} />
            <p className="text-2xl font-semibold tabular-nums text-[#0f2744]">
              {money(invoice.amount, invoice.amountIsApproximate)}
            </p>
          </div>
        </div>

        {invoice.doNotRecreate ? (
          <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            Do not create another GVI Buy invoice for this row. Chase approval and the
            check.
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="bg-white lg:col-span-2">
            <CardHeader>
              <CardTitle>Chase checklist</CardTitle>
              <CardDescription>
                Same path every time: acknowledge → create → attach → submit → receipt →
                check.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {invoice.chaseSteps.map((step, index) => (
                  <li
                    key={step.id}
                    className="flex gap-3 rounded-lg border px-3 py-3"
                  >
                    <span className="w-5 text-xs font-semibold text-muted-foreground tabular-nums">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{step.label}</p>
                        <StepChip state={step.state} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>This invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Portal" value={invoice.portalStatus} />
                <Row
                  label="Fieldwork #"
                  value={
                    invoice.fieldworkNumbers.length
                      ? invoice.fieldworkNumbers.join(", ")
                      : invoice.fieldworkNote || "Not recorded"
                  }
                />
                <Row
                  label="Invoice date"
                  value="Not recorded — add invoiceDate in seed.json to age this row"
                />
                <Row label="Notes" value={invoice.notes} />
              </CardContent>
            </Card>

            {po ? (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Purchase order</CardTitle>
                  <CardDescription>
                    <Link href={`/po/${po.id}`} className="text-[#0f2744] hover:underline">
                      {po.number}
                    </Link>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="Agency" value={po.agency} />
                  <Row label="PO amount" value={money(po.amount)} />
                  {po.amountNote ? <Row label="PO amount note" value={po.amountNote} /> : null}
                  <Row
                    label="Acknowledged"
                    value={po.acknowledged ? "Yes" : "No — blocks Create Invoice"}
                  />
                  <Row
                    label="Remaining to invoice"
                    value={
                      po.remainingToInvoice == null ? "Unknown" : money(po.remainingToInvoice)
                    }
                  />
                  <Row label="Portal" value={po.portalStatus} />
                </CardContent>
              </Card>
            ) : null}

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Blockers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoice.blockers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No blockers recorded.</p>
                ) : (
                  invoice.blockers.map((id) => {
                    const blocker = getBlocker(id);
                    return (
                      <div key={id}>
                        <p className="text-sm font-medium">{blocker?.label || id}</p>
                        <p className="text-sm text-muted-foreground">
                          {blocker?.description}
                        </p>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {openSteps.length > 0 ? (
          <Card className="mt-4 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-950">What Steve must do</CardTitle>
              <CardDescription className="text-red-900/80">
                Only the open steps. Do not skip ahead if a step is blocked.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-red-950">
                {openSteps.map((step) => (
                  <li key={step.id}>
                    <span className="font-medium">{step.label}.</span> {step.detail}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {siblings.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-sm font-semibold tracking-wide text-[#0f2744] uppercase">
              Other invoices on this PO
            </h2>
            <ul className="mt-2 divide-y rounded-xl bg-white ring-1 ring-foreground/10">
              {siblings.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/invoice/${row.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/50"
                  >
                    <span>
                      {invoiceLabel(row.fieldworkNumbers, row.site || row.id)}
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {row.portalStatus}
                      </span>
                    </span>
                    <span className="tabular-nums">
                      {money(row.amount, row.amountIsApproximate)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p>{value}</p>
    </div>
  );
}
