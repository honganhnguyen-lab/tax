import { Sparkles, Lock, ShieldCheck, Pencil, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReturnField } from "@/data/mock";

export function FieldStateChip({ state, className }: { state: ReturnField["state"]; className?: string }) {
  const map = {
    ai: { label: "AI extracted", cls: "chip-ai", icon: <Sparkles className="h-3 w-3" /> },
    verified: { label: "Verified", cls: "chip-verified", icon: <ShieldCheck className="h-3 w-3" /> },
    locked: { label: "Calculated", cls: "chip-locked", icon: <Lock className="h-3 w-3" /> },
    editable: { label: "Editable", cls: "chip-info", icon: <Pencil className="h-3 w-3" /> },
    needs_review: { label: "Needs review", cls: "chip-warning", icon: <AlertCircle className="h-3 w-3" /> },
  } as const;
  const m = map[state];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", m.cls, className)}>
      {m.icon}{m.label}
    </span>
  );
}

export function fieldContainerClass(state: ReturnField["state"]) {
  switch (state) {
    case "ai": return "field-ai";
    case "verified": return "field-verified";
    case "locked": return "field-locked";
    case "needs_review": return "chip-warning border";
    default: return "field-editable";
  }
}
