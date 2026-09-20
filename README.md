# Ocean Pest Control — Government Bid Infrastructure (GBI)

Private collections / AR tracker for **Ocean Pest Control, LLC (Ocean VI)**.

The product is not “prep the next government bid.” It is **get paid on invoices that already exist**: GVI Buy / BuySpeed POs, Fieldwork invoice numbers, blockers, and the documents agencies require before they release a check.

Owner: Steve Vasaturo · Steve@oceanvi.com

## What it does

- **Dashboard (`/`)** — outstanding invoices by agency, aging, and a chase list sorted upload → in portal → verify → hold.
- **Invoice (`/invoice/[id]`)** — per-invoice checklist: acknowledge PO → create GVI Buy e-invoice → attach Fieldwork PDF → submit → receipt → check.
- **PO (`/po/[po]`)** — acknowledged? invoiced? remaining? related Fieldwork rows.
- **Prerequisites (`/prerequisites`)** — SAM, license, insurance, applicator card, W-9, and portal steps that gate payment.

No login in v1. Treat the deploy as private.

## Collections workflow

1. **Acknowledge the PO** in GVI Buy. `PO Sent 3PS` blocks Create Invoice.
2. **Create the GVI Buy e-invoice** for the dollars you can support from Fieldwork. Do not pad to the PO.
3. **Attach a clean Fieldwork PDF** — correct PO# on the face, no balance-forward junk.
4. **Submit.**
5. **Track receipt / approval** (example: BMV Tutu Inv 82223 is already `4IR Ready for Approval` — chase pay, do not re-create).
6. **Track to check.** `Complete Receipt` and `Closed` are not proof of deposit. Verify before calling.

HOLD rows (PO `:36`) stay off the invoice path until email vs portal dollars are reconciled.

## Run locally

```bash
npm install
npm run dev
```

App binds to **http://127.0.0.1:43187**.

```bash
npm run build
npm start -- --port 43187
```

## Edit the facts (no database)

All numbers live in [`src/data/seed.json`](src/data/seed.json). If a figure was not in the 2026-09-20 session, it is omitted or marked unknown. Do not invent invoice amounts, PO totals, UEI, or expiration dates.

### Add an invoice

1. Confirm the PO exists under `purchaseOrders` (or add it). Use `id` like `834-42` matching `PO-24-001-00101-834:42`.
2. Append an object to `invoices`:

```json
{
  "id": "83199",
  "poId": "834-42",
  "agency": "Lt Gov",
  "site": null,
  "fieldworkNumbers": ["83199"],
  "fieldworkNote": null,
  "amount": 90,
  "amountIsApproximate": false,
  "invoiceDate": "2026-09-12",
  "lane": "upload",
  "portalStatus": "PO Sent 3PS — portal invoice not created",
  "blockers": ["po_not_acknowledged", "portal_invoice_not_created"],
  "chaseSteps": [],
  "notes": "Copy chaseSteps from a similar upload row.",
  "doNotRecreate": false
}
```

3. `lane`: `upload` | `in_portal` | `verify` | `hold`
4. Set `invoiceDate` (YYYY-MM-DD) when you know it — aging buckets stay “Date unknown” until you do.
5. Reuse `blockers` ids from `blockerCatalog`.

### Add a payment prerequisite

Append to `prerequisites`. `status` is `current` | `expiring` | `expired` | `missing`. If `expirationDate` is set, the app recomputes current / expiring (≤90 days) / expired from `asOf`.

## Seed snapshot (2026-09-20)

**Upload (PO Sent 3PS)**

| PO | Agency | What to bill |
| --- | --- | --- |
| `:4` | FEMS firestations | PO $855 · ~6 Fieldwork invoices ~$600 · ~$255 short |
| `:37` | BOC Farrelly | Inv 83063 $180 against a larger PO |
| `:42` | Lt Gov | Inv 83197 $135 + Inv 83090 $90 = $225 |
| `:38` | OVA STT | Inv 82701 $90 |

**In portal**

| PO | Agency | Status |
| --- | --- | --- |
| `:43` | BMV Tutu | Inv 82223 · 4IR Ready for Approval · Remaining $0 · do not re-create |

**Verify not unpaid**

| PO | Agency | Status |
| --- | --- | --- |
| `:40` | Governor | Inv 82924 $180 · Complete Receipt |
| `:39` | VITRAN | Inv 81721 $90 · Closed |
| `:41` | Unknown | $90 · Closed · agency / Fieldwork # not recorded |

**Hold**

| PO | Notes |
| --- | --- |
| `:36` | Email Sports/Parks $270 vs portal $3640 Ready to Send. StJ CC Inv 83097 $90 waiting. Winston / Main Office still scheduled. Do not invoice. |

## Deploy

Static-enough Next.js app. No database, no secrets required for v1.

- **Vercel:** import the repo, default Next build, no env vars.
- **Origin / other Node host:** `npm run build` then `npm start` behind HTTPS. Do not put this on a public URL without auth.

When you add auth later, keep the seed file as the source of truth until you are ready for a real AR system.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui. Data is JSON + TypeScript types in `src/lib/types.ts`.
