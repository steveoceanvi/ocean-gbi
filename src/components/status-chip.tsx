import { Badge } from "@/components/ui/badge";
import type { InvoiceLane, PrerequisiteStatus, StepState } from "@/lib/types";
import { LANE_LABEL } from "@/lib/ar";
import { cn } from "@/lib/utils";

const laneClass: Record<InvoiceLane, string> = {
  upload: "border-transparent bg-red-100 text-red-900",
  in_portal: "border-transparent bg-amber-100 text-amber-950",
  verify: "border-transparent bg-amber-50 text-amber-900 ring-1 ring-amber-200",
  hold: "border-transparent bg-slate-200 text-slate-800",
};

const prereqClass: Record<PrerequisiteStatus, string> = {
  current: "border-transparent bg-emerald-100 text-emerald-900",
  expiring: "border-transparent bg-amber-100 text-amber-950",
  expired: "border-transparent bg-red-100 text-red-900",
  missing: "border-transparent bg-red-100 text-red-900",
};

const prereqLabel: Record<PrerequisiteStatus, string> = {
  current: "Current",
  expiring: "Expiring",
  expired: "Expired",
  missing: "Missing",
};

const stepClass: Record<StepState, string> = {
  todo: "border-transparent bg-red-100 text-red-900",
  blocked: "border-transparent bg-red-100 text-red-900",
  verify: "border-transparent bg-amber-100 text-amber-950",
  done: "border-transparent bg-emerald-100 text-emerald-900",
  na: "border-transparent bg-slate-100 text-slate-600",
};

const stepLabel: Record<StepState, string> = {
  todo: "To do",
  blocked: "Blocked",
  verify: "Verify",
  done: "Done",
  na: "N/A",
};

export function LaneChip({ lane }: { lane: InvoiceLane }) {
  return <Badge className={cn("font-medium", laneClass[lane])}>{LANE_LABEL[lane]}</Badge>;
}

export function PrereqChip({ status }: { status: PrerequisiteStatus }) {
  return <Badge className={cn("font-medium", prereqClass[status])}>{prereqLabel[status]}</Badge>;
}

export function StepChip({ state }: { state: StepState }) {
  return <Badge className={cn("font-medium", stepClass[state])}>{stepLabel[state]}</Badge>;
}
