export type InvoiceLane = "upload" | "in_portal" | "verify" | "hold";

export type StepState = "todo" | "done" | "blocked" | "na" | "verify";

export type PrerequisiteStatus = "current" | "expiring" | "expired" | "missing";

export type ChaseStepId =
  | "acknowledge_po"
  | "clean_pdf"
  | "create_einvoice"
  | "attach_pdf"
  | "submit"
  | "receipt"
  | "approval"
  | "payment";

export interface Company {
  legalName: string;
  shortName: string;
  email: string;
  phone: string;
  physicalAddress: string;
  mailingAddress: string;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  agency: string;
  site: string | null;
  amount: number | null;
  amountNote: string | null;
  portalStatus: string;
  acknowledged: boolean;
  remainingToInvoice: number | null;
  lane: InvoiceLane;
  notes: string;
}

export interface ChaseStep {
  id: ChaseStepId;
  label: string;
  state: StepState;
  detail: string;
}

export interface Invoice {
  id: string;
  poId: string;
  agency: string;
  site: string | null;
  fieldworkNumbers: string[];
  fieldworkNote: string | null;
  amount: number | null;
  amountIsApproximate: boolean;
  invoiceDate: string | null;
  lane: InvoiceLane;
  portalStatus: string;
  blockers: string[];
  chaseSteps: ChaseStep[];
  notes: string;
  doNotRecreate: boolean;
}

export interface Prerequisite {
  id: string;
  title: string;
  category: string;
  status: PrerequisiteStatus;
  documentNumber: string | null;
  issuer: string | null;
  effectiveDate: string | null;
  expirationDate: string | null;
  driveHint: string | null;
  notes: string;
  actionNeeded: string | null;
}

export interface BlockerDefinition {
  id: string;
  label: string;
  description: string;
}

export interface Seed {
  asOf: string;
  company: Company;
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  prerequisites: Prerequisite[];
  blockerCatalog: BlockerDefinition[];
}

export type AgingBucket = "current" | "30" | "60" | "90+" | "unaged";
