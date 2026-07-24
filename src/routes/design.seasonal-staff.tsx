import { createFileRoute } from "@tanstack/react-router";
import { returns, statusMeta } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lock, CalendarClock } from "lucide-react";

export const Route = createFileRoute("/design/seasonal-staff")({
  head: () => ({
    meta: [
      { title: "Seasonal staff — design preview · Ledgerline" },
      { name: "description", content: "Design-only preview of the seasonal staff experience." },
      { property: "og:title", content: "Seasonal staff — design preview" },
      { property: "og:description", content: "Design-only preview of the seasonal staff experience." },
    ],
  }),
  component: Seasonal,
});

function Seasonal() {
  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-4">
      <DesignBanner
        title="Seasonal staff — design preview"
        body="Same shell as the preparer role with e-file, approve, and billing controls disabled. Not built — the point is that permissions narrow an existing role instead of forking a new one."
      />

      {/* Time-boxed access banner */}
      <Card className="p-4 border-warning/40 bg-warning/5 flex items-center gap-3">
        <CalendarClock className="h-5 w-5 text-warning" />
        <div className="flex-1">
          <div className="font-medium">Time-boxed access</div>
          <div className="text-xs text-muted-foreground">Your account is active for tax season. Access expires <b>Apr 30, 2025</b>.</div>
        </div>
        <Badge className="chip-warning">Seasonal</Badge>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Assigned to you" value={8} />
        <Kpi label="Data entry" value={6} />
        <Kpi label="Doc review" value={2} />
        <Kpi label="E-file" value="—" locked hint="Requires reviewer" />
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your queue</h2>
        <Card className="divide-y">
          {returns.slice(0, 5).map(r => (
            <div key={r.id} className="p-3 flex items-center gap-3 text-sm">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{r.clientName}</div>
                <div className="text-xs text-muted-foreground truncate">{r.form} · {statusMeta[r.status].label}</div>
              </div>
              <Button variant="secondary" size="sm">Open</Button>
              <Button size="sm" disabled className="opacity-60">
                <Lock className="h-3 w-3 mr-1" />Approve
              </Button>
            </div>
          ))}
        </Card>
      </section>

      <Card className="p-4 text-sm bg-muted/40 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
        <div>
          <div className="font-medium">Permissions removed for this role</div>
          <ul className="text-xs text-muted-foreground mt-1 list-disc pl-5 space-y-0.5">
            <li>Cannot e-file returns</li>
            <li>Cannot approve a return for filing</li>
            <li>Cannot see firm billing or invoices</li>
            <li>Cannot invite or manage other staff</li>
          </ul>
        </div>
      </Card>
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

function Kpi({ label, value, locked, hint }: { label: string; value: number | string; locked?: boolean; hint?: string }) {
  return (
    <Card className={`p-4 ${locked ? "opacity-60" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        {locked && <Lock className="h-3 w-3" />}{label}
      </div>
      <div className="mt-2 text-2xl font-semibold font-mono">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </Card>
  );
}
