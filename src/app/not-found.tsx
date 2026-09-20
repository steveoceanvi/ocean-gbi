import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-[#0f2744]">Not in the seed</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          That invoice or PO is not in src/data/seed.json. Add it there if it is a real
          Ocean row — do not invent amounts.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-[#0f2744] underline">
          Back to collections
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
