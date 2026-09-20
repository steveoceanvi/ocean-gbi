import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneChip } from "@/components/status-chip";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getPurchaseOrder, invoicesForPo, seed, sumAmounts } from "@/lib/ar";
import { invoiceLabel, money } from "@/lib/format";

export function generateStaticParams() {
  return seed.purchaseOrders.map((po) => ({ po: po.id }));
}

export default async function PurchaseOrderPage({
  params,
}: {
  params: Promise<{ po: string }>;
}) {
  const { po: poId } = await params;
  const po = getPurchaseOrder(poId);
  if (!po) notFound();

  const invoices = invoicesForPo(po.id);
  const invoiced = sumAmounts(invoices.filter((row) => row.amount != null && row.lane !== "hold"));

  return (
    <>
      <SiteHeader current="/" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            Collections
          </Link>
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#0f2744]">
              {po.number}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {po.agency}
              {po.site ? ` · ${po.site}` : ""}
            </p>
          </div>
          <LaneChip lane={po.lane} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Card className="bg-white">
            <CardHeader>
              <CardDescription>PO amount</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{money(po.amount)}</CardTitle>
            </CardHeader>
            {po.amountNote ? (
              <CardContent className="text-xs text-muted-foreground">{po.amountNote}</CardContent>
            ) : null}
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <CardDescription>Acknowledged</CardDescription>
              <CardTitle>{po.acknowledged ? "Yes" : "No"}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {po.acknowledged
                ? "Create Invoice should be available."
                : "PO Sent 3PS / unacked. Acknowledge before creating an e-invoice."}
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <CardDescription>Remaining to invoice</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {po.remainingToInvoice == null ? "Unknown" : money(po.remainingToInvoice)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Known Fieldwork on this PO: {money(invoiced.total, invoiced.approximate)}
              {po.amount != null && invoiced.knownCount > 0
                ? ` · recorded shortfall vs PO ${money(Math.max(po.amount - invoiced.total, 0))}`
                : ""}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4 bg-white">
          <CardHeader>
            <CardTitle>Portal status</CardTitle>
            <CardDescription>{po.portalStatus}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{po.notes}</CardContent>
        </Card>

        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold tracking-wide text-[#0f2744] uppercase">
            Invoices on this PO
          </h2>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No Fieldwork rows recorded.</p>
          ) : (
            <ul className="divide-y rounded-xl bg-white ring-1 ring-foreground/10">
              {invoices.map((invoice) => (
                <li key={invoice.id}>
                  <Link
                    href={`/invoice/${invoice.id}`}
                    className="flex flex-col gap-2 px-4 py-3 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-[#0f2744]">
                        {invoiceLabel(
                          invoice.fieldworkNumbers,
                          invoice.fieldworkNote || invoice.site || invoice.id,
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{invoice.portalStatus}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular-nums">
                        {money(invoice.amount, invoice.amountIsApproximate)}
                      </span>
                      <LaneChip lane={invoice.lane} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
