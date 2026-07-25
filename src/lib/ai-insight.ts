import { fmt$, type ReturnField } from "@/data/mock";

export type ConfidenceTier = "high" | "medium" | "low";

export type RecommendedAction =
  "approve" | "confirm_with_client" | "already_verified" | "calculated";

export interface AIInsight {
  fieldId: string;
  summary: string;
  confidence: number | null;
  confidenceTier: ConfidenceTier | null;
  confidenceReason: string;
  reasoning: string;
  evidence: { docName: string; page: number; box: string }[];
  warnings: string[];
  suggestedCorrection?: { label: string; reason: string };
  recommendedAction: RecommendedAction;
  actionLabel: string;
}

/**
 * Stands in for a real extraction/recommendation service. A production
 * version would call out to a model and return this same shape; here it's
 * derived deterministically from the field's own confidence/transform data
 * so the UI is driven by one consistent "response object" either way.
 */
export function getAIInsight(field: ReturnField, docNameById: (id: string) => string): AIInsight {
  const tier = tierFor(field.confidence);
  const warnings: string[] = [];
  let suggestedCorrection: AIInsight["suggestedCorrection"];

  for (const s of field.sources) {
    if (s.transform?.toLowerCase().includes("duplicate")) {
      warnings.push("A possible duplicate was found across the source documents.");
      suggestedCorrection = {
        label: `Keep ${fmt$(field.value)} — duplicate already excluded`,
        reason: s.transform,
      };
    }
  }

  const evidence = field.sources.map((s) => ({
    docName: docNameById(s.docId),
    page: s.page,
    box: s.box,
  }));

  const { recommendedAction, actionLabel } = actionFor(field, tier, warnings.length > 0);

  return {
    fieldId: field.id,
    summary: summaryFor(field),
    confidence: field.confidence ?? null,
    confidenceTier: tier,
    confidenceReason: reasonFor(field, tier),
    reasoning: field.calc ?? "Copied directly from the source document, no calculation applied.",
    evidence,
    warnings,
    suggestedCorrection,
    recommendedAction,
    actionLabel,
  };
}

function tierFor(confidence?: number): ConfidenceTier | null {
  if (confidence == null) return null;
  if (confidence >= 0.9) return "high";
  if (confidence >= 0.75) return "medium";
  return "low";
}

function summaryFor(field: ReturnField): string {
  const n = field.sources.length;
  if (field.state === "locked") {
    return `Calculated ${fmt$(field.value)} for ${field.label} from ${n} verified line${n === 1 ? "" : "s"}.`;
  }
  if (n === 0) {
    return `No source document linked yet for ${field.label}.`;
  }
  if (n === 1) {
    return `Extracted ${fmt$(field.value)} for ${field.label} from ${field.sources[0].box}.`;
  }
  return `Combined ${fmt$(field.value)} for ${field.label} from ${n} source documents.`;
}

function reasonFor(field: ReturnField, tier: ConfidenceTier | null): string {
  if (tier === "high") return "A single, clean match with no conflicting evidence.";
  if (tier === "medium") return "Matched with a small amount of ambiguity — worth a quick glance.";
  if (tier === "low")
    return "Pulled together from multiple documents — please confirm before filing.";
  if (field.state === "verified") return "Already confirmed by a preparer.";
  return "Calculated automatically from other verified lines on this return.";
}

function actionFor(
  field: ReturnField,
  tier: ConfidenceTier | null,
  hasWarning: boolean,
): { recommendedAction: RecommendedAction; actionLabel: string } {
  if (field.state === "locked") {
    return { recommendedAction: "calculated", actionLabel: "No action needed — calculated" };
  }
  if (field.state === "verified") {
    return { recommendedAction: "already_verified", actionLabel: "Already verified" };
  }
  if (hasWarning || tier === "low") {
    return { recommendedAction: "confirm_with_client", actionLabel: "Confirm with client" };
  }
  return { recommendedAction: "approve", actionLabel: "Approve" };
}
