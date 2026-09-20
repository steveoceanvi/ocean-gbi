import { Dashboard } from "@/components/dashboard";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { LANE_ORDER } from "@/lib/ar";
import type { InvoiceLane } from "@/lib/types";

function parseLane(value: string | undefined): InvoiceLane | "all" {
  if (value && (LANE_ORDER as string[]).includes(value)) {
    return value as InvoiceLane;
  }
  return "all";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lane?: string; agency?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <SiteHeader current="/" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Dashboard lane={parseLane(params.lane)} agency={params.agency ?? "all"} />
      </main>
      <SiteFooter />
    </>
  );
}
