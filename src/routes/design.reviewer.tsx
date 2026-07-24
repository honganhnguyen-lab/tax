import { createFileRoute } from "@tanstack/react-router";
import { returns, fields, statusMeta } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageSquareWarning, PencilLine, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/design/reviewer")({
  head: () => ({
    meta: [
      { title: "Reviewer — design preview · Ledgerline" },
      { name: "description", content: "Design-only preview of the reviewer workspace." },
      { property: "og:title", content: "Reviewer — design preview" },
      { property: "og:description", content: "Design-only preview of the reviewer workspace." },
    ],
  }),
  component: Reviewer,
});

function Reviewer() {
  const queue = returns.filter(r => r.status === "in_review" || r.status === "ready_to_file");
  const active = queue[0] ?? returns[0];
  const activeFields = fields.filter(f => f.returnId === active.id);

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-4">
      <DesignBanner
        title="Reviewer — design preview"
        body="Nearly identical to the preparer workspace, plus: a review queue instead of an assigned queue, Approve / Send-back actions, and a reviewer-edit audit chip. Not built — this proves it slots into the preparer surface."
      />

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        {/* Review queue */}
        <Card className="p-3 h-fit">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">Submitted for review</div>
          <ul className="mt-1 space-y-1">
            {queue.map((r, i) => (
              <li
                key={r.id}
                className={`p-2 rounded-md text-sm ${i === 0 ? "bg-accent/10 border border-accent/30" : "hover:bg-muted/50"}`}
              >
                <div className="font-medium truncate">{r.clientName}</div>
                <div className="text-xs text-muted-foreground truncate">{r.form} · {statusMeta[r.status].label}</div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Workspace */}
        <div className="space-y-3">
          <Card className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Reviewing</div>
              <div className="font-semibold">{active.clientName} · {active.form}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <MessageSquareWarning className="h-4 w-4 mr-1.5" />Send back with comments
              </Button>
              <Button size="sm">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />Approve for filing
              </Button>
            </div>
          </Card>

          <Card className="divide-y">
            {activeFields.slice(0, 5).map((f, i) => (
              <div key={f.id} className="p-3 flex items-center gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{f.line} — {f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.section}</div>
                </div>
                <div className="font-mono">{f.value.toLocaleString()}</div>
                {i === 1 ? (
                  <Badge className="chip-internal gap-1"><PencilLine className="h-3 w-3" />Reviewer edit</Badge>
                ) : (
                  <Badge className="chip-verified gap-1"><ShieldCheck className="h-3 w-3" />OK</Badge>
                )}
              </div>
            ))}
          </Card>

          <Card className="p-4 text-sm">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Audit trail</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>2025-03-04 14:12 · Preparer Morgan Ellis submitted for review</li>
              <li>2025-03-04 15:22 · Reviewer Priya Shah edited Line 2b (was $1,252 → $1,284)</li>
              <li>2025-03-04 15:24 · Reviewer added note: "matched 1099-INT authoritative"</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DesignBanner({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-dashed border-accent/40 bg-accent/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-accent font-semibold">Design preview — not interactive</div>
      <h1 className="text-lg font-semibold mt-1">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{body}</p>
    </div>
  );
}
