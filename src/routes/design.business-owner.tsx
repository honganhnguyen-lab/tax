import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, FileText, Receipt, Users, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/design/business-owner")({
  head: () => ({
    meta: [
      { title: "Business owner — design preview · Ledgerline" },
      { name: "description", content: "Design-only preview of the business owner experience." },
      { property: "og:title", content: "Business owner — design preview" },
      { property: "og:description", content: "Design-only preview of the business owner experience." },
    ],
  }),
  component: BusinessOwner,
});

function BusinessOwner() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <DesignBanner
        title="Business owner — design preview"
        body="This role reuses the individual-client shell with an entities switcher and a business-documents section. Not built — shown here to prove the architecture extends without a new role."
      />

      {/* Entity switcher */}
      <Card className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Filing for</div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Personal", form: "1040", active: true },
            { name: "Acme LLC", form: "1120-S", active: false },
            { name: "Contoso Studio Inc.", form: "1120", active: false },
          ].map(e => (
            <button
              key={e.name}
              className={`text-sm rounded-md border px-3 py-2 flex items-center gap-2 ${
                e.active ? "border-accent bg-accent/10 text-accent" : "border-border hover:bg-muted/50"
              }`}
            >
              {e.name === "Personal" ? <Users className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              <div className="text-left">
                <div className="font-medium">{e.name}</div>
                <div className="text-[10px] text-muted-foreground">Form {e.form}</div>
              </div>
            </button>
          ))}
          <button className="text-sm rounded-md border border-dashed border-border px-3 py-2 text-muted-foreground hover:text-foreground">
            + Add entity
          </button>
        </div>
      </Card>

      {/* Side-by-side status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Personal return · 2024</div>
            <Badge className="chip-warning">Your turn</Badge>
          </div>
          <Progress value={62} className="mt-3" />
          <div className="mt-2 text-xs text-muted-foreground">Answer 3 questions · due Apr 15</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Acme LLC · 2024 (S-Corp)</div>
            <Badge className="chip-info">In review</Badge>
          </div>
          <Progress value={84} className="mt-3" />
          <div className="mt-2 text-xs text-muted-foreground">Reviewer sign-off · due Mar 15</div>
        </Card>
      </div>

      {/* Business docs */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Business documents (Acme LLC)</h2>
        <Card className="divide-y">
          {[
            { name: "2024 Profit & Loss.pdf", kind: "P&L", pages: 4 },
            { name: "Q4 payroll summary — Gusto.csv", kind: "Payroll", pages: 1 },
            { name: "State sales tax filings 2024.pdf", kind: "Sales Tax", pages: 12 },
            { name: "Balance sheet — Dec 31 2024.pdf", kind: "Balance", pages: 2 },
          ].map(d => (
            <div key={d.name} className="p-3 flex items-center gap-3 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.kind} · {d.pages}p</div>
              </div>
              <Badge className="chip-ai gap-1"><Sparkles className="h-3 w-3" />AI extracted</Badge>
            </div>
          ))}
        </Card>
      </section>

      <p className="text-xs text-muted-foreground text-center inline-flex items-center gap-1 mx-auto">
        Messaging, e-sign, and status flow all reuse the individual client screens <ArrowRight className="h-3 w-3" />
      </p>
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
