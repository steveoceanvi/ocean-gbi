import Link from "next/link";
import { seed } from "@/lib/ar";

const nav = [
  { href: "/", label: "Collections" },
  { href: "/prerequisites", label: "Payment prerequisites" },
];

export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="border-b border-white/10 bg-[#0f2744] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[11px] font-medium tracking-[0.14em] text-white/60 uppercase">
            Ocean Pest Control, LLC · {seed.company.shortName}
          </p>
          <Link href="/" className="mt-0.5 block text-lg font-semibold tracking-tight">
            Government Bid Infrastructure
          </Link>
          <p className="text-sm text-white/70">
            Collections / AR — get existing government invoices paid
          </p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {nav.map((item) => {
            const active = item.href === current;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "rounded-md bg-white px-3 py-1.5 text-sm font-medium text-[#0f2744]"
                    : "rounded-md px-3 py-1.5 text-sm text-white/80 ring-1 ring-white/20 hover:bg-white/10"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <p>
          Private operations tool for {seed.company.legalName}. Snapshot {seed.asOf}. No
          auth in v1.
        </p>
        <p>
          {seed.company.email} · {seed.company.phone}
        </p>
      </div>
    </footer>
  );
}
