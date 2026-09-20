import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrereqChip } from "@/components/status-chip";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { resolvePrerequisiteStatus, seed } from "@/lib/ar";
import { formatDate } from "@/lib/format";

export default function PrerequisitesPage() {
  const items = seed.prerequisites.map((item) => ({
    ...item,
    resolved: resolvePrerequisiteStatus(item),
  }));
  const gaps = items.filter(
    (item) => item.resolved !== "current" || item.actionNeeded,
  );

  return (
    <>
      <SiteHeader current="/prerequisites" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0f2744]">
          Payment prerequisites
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          These are the files and portal steps agencies commonly require before they
          release a check. This is not a bid packet. If SAM is inactive, the W-9 is
          missing from the vendor file, or the PO is unacknowledged, the invoice can sit
          forever.
        </p>

        {gaps.length > 0 ? (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-950">Gaps that can hold payment</CardTitle>
              <CardDescription className="text-red-900/80">
                Current certificates still listed here if a verify step remains.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm text-red-950">
                {gaps.map((item) => (
                  <li key={item.id}>
                    <span className="font-medium">{item.title}.</span>{" "}
                    {item.actionNeeded || item.notes}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-6 grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className="bg-white">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {item.category}
                    </p>
                    <CardTitle className="mt-1">{item.title}</CardTitle>
                    {item.documentNumber ? (
                      <CardDescription className="font-mono text-xs">
                        {item.documentNumber}
                      </CardDescription>
                    ) : null}
                  </div>
                  <PrereqChip status={item.resolved} />
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <Field label="Issuer" value={item.issuer || "—"} />
                <Field
                  label="Effective"
                  value={formatDate(item.effectiveDate)}
                />
                <Field
                  label="Expiration"
                  value={formatDate(item.expirationDate)}
                />
                <Field
                  label="Drive / file"
                  value={item.driveHint || "—"}
                />
                <div className="sm:col-span-2">
                  <Field label="Notes" value={item.notes} />
                </div>
                {item.actionNeeded ? (
                  <div className="sm:col-span-2 rounded-md bg-amber-50 px-3 py-2 text-amber-950">
                    <p className="text-xs font-medium tracking-wide uppercase">
                      Action
                    </p>
                    <p>{item.actionNeeded}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Open invoices are on the{" "}
          <Link href="/" className="text-[#0f2744] underline-offset-2 hover:underline">
            collections dashboard
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p>{value}</p>
    </div>
  );
}
