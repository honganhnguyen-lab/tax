import { createFileRoute, Link } from "@tanstack/react-router";
import { returns, fields, tasks, threads, documents, statusMeta, fmt$ } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldStateChip } from "@/components/FieldChip";
import { CheckCircle2, Clock, Circle, ArrowRight, ScanSearch, Sparkles, ShieldCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/returns/$id/")({
  component: Overview,
});

function Overview() {
  const { id } = Route.useParams();
  const r = returns.find(x => x.id === id)!;
  const rTasks = tasks.filter(t => t.returnId === id);
  const rThreads = threads.filter(t => t.returnId === id);
  const rDocs = documents.filter(d => d.returnId === id);
  const rFields = fields.filter(f => f.returnId === id);

  const timeline = [
    { at: "2025-02-01", label: "Return created", who: "Morgan Ellis", done: true },
    { at: "2025-02-05", label: "Client uploaded 5 documents", who: "Jamie Chen", done: true },
    { at: "2025-02-12", label: "AI extracted 47 line items", who: "Copilot", done: true },
    { at: "2025-03-04", label: "3 questions sent to client", who: "Morgan Ellis", done: r.status !== "collecting_docs" },
    { at: "—", label: "Reviewer sign-off", who: "Priya Shah", done: false },
    { at: "—", label: "Client e-sign & file", who: "Jamie Chen", done: false },
  ];

  const aiCount = rFields.filter(f => f.state === "ai").length;
  const verifiedCount = rFields.filter(f => f.state === "verified").length;
  const reviewCount = rFields.filter(f => f.state === "needs_review").length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Where things stand</h2>
            <Badge className="chip-info">{statusMeta[r.status].label}</Badge>
          </div>
          <ol className="relative border-l-2 border-border ml-2 space-y-4">
            {timeline.map((t, i) => (
              <li key={i} className="pl-4 relative">
                <span className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${t.done ? "bg-verified border-verified" : "bg-background border-muted-foreground/40"}`} />
                <div className="text-sm font-medium">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.who} · {t.at}</div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-ai" />
              <h3 className="font-semibold text-sm">AI extraction summary</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <StatBlock n={aiCount} label="AI" tone="ai" />
              <StatBlock n={verifiedCount} label="Verified" tone="verified" />
              <StatBlock n={reviewCount} label="Review" tone="warning" />
            </div>
            <Link to="/returns/$id/review" params={{ id }} className="mt-4 inline-flex items-center gap-1 text-sm text-accent font-medium hover:underline">
              Open source review <ArrowRight className="h-3 w-3" />
            </Link>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-sm mb-3">This return</h3>
            <dl className="space-y-2 text-sm">
              <Row k="Documents" v={`${rDocs.length}`} />
              <Row k="Open threads" v={`${rThreads.filter(t=>t.status!=="resolved").length}`} />
              <Row k="Open tasks" v={`${rTasks.filter(t=>t.status!=="done").length}`} />
              <Row k="Blocked?" v={r.blocked ?? "No"} tone={r.blocked ? "warning" : undefined} />
            </dl>
          </Card>
        </div>
      </div>

      {/* Recent items across contexts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-3">Latest activity</h3>
          <ul className="divide-y">
            {rThreads.slice(0, 3).map(t => (
              <li key={t.id} className="py-2.5 text-sm">
                <Link to="/returns/$id/messages" params={{ id }} className="hover:underline font-medium">{t.subject}</Link>
                <div className="text-xs text-muted-foreground truncate">{t.messages[t.messages.length-1].body}</div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-3">Open tasks</h3>
          <ul className="divide-y">
            {rTasks.filter(t=>t.status!=="done").slice(0,4).map(t => (
              <li key={t.id} className="py-2.5 text-sm flex items-center gap-2">
                {t.status === "waiting" ? <Clock className="h-3.5 w-3.5 text-warning" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className="flex-1 truncate">{t.title}</span>
                <span className="text-xs text-muted-foreground">{t.owner === "u_client" ? "Client" : t.owner === "u_reviewer" ? "Reviewer" : "You"}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: "warning" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={tone === "warning" ? "text-warning font-medium" : "font-medium"}>{v}</dd>
    </div>
  );
}

function StatBlock({ n, label, tone }: { n: number; label: string; tone: "ai"|"verified"|"warning" }) {
  const cls = tone === "ai" ? "text-ai" : tone === "verified" ? "text-verified" : "text-warning";
  return (
    <div>
      <div className={`text-2xl font-semibold font-mono ${cls}`}>{n}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
