import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmt$ } from "@/data/mock";
import type { AIInsight } from "@/lib/ai-insight";
import {
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Pencil,
  Undo2,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Correction {
  value: number;
  reason: string;
  at: string;
}

const tierMeta = {
  high: { label: "High confidence", cls: "chip-verified" },
  medium: { label: "Medium confidence", cls: "chip-ai" },
  low: { label: "Low confidence", cls: "chip-warning" },
} as const;

const reasonOptions = [
  "OCR misread the value",
  "Duplicate document",
  "Client confirmed a different amount",
  "Other",
];

export function AIInsightPanel({
  insight,
  currentValue,
  correction,
  actioned,
  showEvidence,
  onToggleEvidence,
  onApprove,
  onAskClient,
  onCorrect,
  onUndoCorrection,
  evidenceSlot,
}: {
  insight: AIInsight;
  currentValue: number;
  correction?: Correction;
  actioned?: "approved" | "asked_client";
  showEvidence: boolean;
  onToggleEvidence: () => void;
  onApprove: () => void;
  onAskClient: () => void;
  onCorrect: (value: number, reason: string) => void;
  onUndoCorrection: () => void;
  evidenceSlot: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(String(currentValue));
  const [draftReason, setDraftReason] = useState(reasonOptions[0]);

  const tier = insight.confidenceTier ? tierMeta[insight.confidenceTier] : null;

  const submitCorrection = () => {
    const n = Number(draftValue);
    if (!Number.isFinite(n)) return;
    onCorrect(n, draftReason);
    setEditing(false);
  };

  return (
    <Card className="p-4 space-y-3">
      {/* What the AI did */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full chip-ai">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="text-sm font-medium leading-snug">{insight.summary}</div>
            {tier && (
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                    tier.cls,
                  )}
                >
                  {tier.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {insight.confidenceReason}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warnings / suggested correction */}
      {insight.warnings.length > 0 && !correction && (
        <div className="rounded-md chip-warning p-2.5 text-xs flex gap-2 items-start">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">{insight.warnings[0]}</div>
            {insight.suggestedCorrection && (
              <div className="mt-0.5 text-muted-foreground">
                {insight.suggestedCorrection.label}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Correction audit trail */}
      {correction && (
        <div className="rounded-md border border-border bg-muted/40 p-2.5 text-xs flex items-start justify-between gap-2">
          <div>
            <span className="font-medium">You corrected this</span> to {fmt$(correction.value)} —{" "}
            {correction.reason}
          </div>
          <button
            onClick={onUndoCorrection}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground shrink-0"
          >
            <Undo2 className="h-3 w-3" /> Undo
          </button>
        </div>
      )}

      {/* Recommended action */}
      {!correction && !actioned && insight.recommendedAction !== "calculated" && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {insight.recommendedAction === "already_verified" ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-verified" /> Already verified
            </span>
          ) : insight.recommendedAction === "confirm_with_client" ? (
            <Button size="sm" onClick={onAskClient}>
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Confirm with client
            </Button>
          ) : (
            <Button size="sm" onClick={onApprove}>
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Approve
            </Button>
          )}
          {!editing && (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Correct it
            </Button>
          )}
        </div>
      )}

      {actioned && !correction && (
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs text-verified">
            {actioned === "approved" ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" /> Approved
              </>
            ) : (
              <>
                <MessageSquare className="h-3.5 w-3.5" /> Sent to client for confirmation
              </>
            )}
          </span>
          {!editing && (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Correct it
            </Button>
          )}
        </div>
      )}

      {insight.recommendedAction === "calculated" && (
        <div className="text-xs text-muted-foreground">{insight.actionLabel}</div>
      )}

      {/* Inline correction form */}
      {editing && (
        <div className="rounded-md border border-border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              className="h-8 w-32 font-mono text-sm"
            />
            <select
              value={draftReason}
              onChange={(e) => setDraftReason(e.target.value)}
              className="h-8 flex-1 rounded-md border border-input bg-transparent px-2 text-xs"
            >
              {reasonOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={submitCorrection}>
              Save correction
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Why / evidence disclosure */}
      <button
        onClick={onToggleEvidence}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground pt-1"
      >
        {showEvidence ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        Why, and where this came from
      </button>
      {showEvidence && (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-muted-foreground">{insight.reasoning}</p>
          {evidenceSlot}
        </div>
      )}
    </Card>
  );
}
