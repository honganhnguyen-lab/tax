import { createFileRoute, Link } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import {
  returns, tasks, threads, onboarding, statusMeta, fmt$, neededDocs, staff, invoices,
} from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Circle, Clock, ArrowRight, TrendingUp, Users as UsersIcon, FileClock,
  Sparkles, MessageSquare, Upload, Landmark, Briefcase, AlertTriangle, DollarSign,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ledgerline — Home" },
      { name: "description", content: "Role-aware home for individual clients, tax preparers, and firm administrators." },
      { property: "og:title", content: "Ledgerline — Home" },
      { property: "og:description", content: "Role-aware home for individual clients, tax preparers, and firm administrators." },
    ],
  }),
  component: Home,
});

function Home() {
  const { activeRole } = useRole();
  switch (activeRole) {
    case "preparer": return <PreparerQueue />;
    case "firm_admin": return <FirmDashboard />;
    case "client_individual":
    default: return <ClientHome />;
  }
}

/* ---------------- Preparer work queue ---------------- */
function PreparerQueue() {
  const urgent = [...returns]
    .filter(r => r.status !== "filed")
    .sort((a, b) => {
      const p = { urgent: 0, high: 1, normal: 2, low: 3 } as const;
      if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
      return a.dueDate.localeCompare(b.dueDate);
    });
  const myTurn = urgent.filter(r => r.nextActionOwner === "u_cpa");
  const waitingClient = urgent.filter(r => r.nextActionOwner === "u_client");
  const inReview = urgent.filter(r => r.nextActionOwner === "u_reviewer");

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px]">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Your work queue</h1>
          <p className="text-sm text-muted-foreground">
            <b>{returns.filter(r=>r.status!=="filed").length}</b> active returns assigned to you · <b>{myTurn.length}</b> need your attention.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm"><FileClock className="h-4 w-4 mr-1.5" />March deadlines</Button>
          <Button size="sm"><Sparkles className="h-4 w-4 mr-1.5" />Ask copilot</Button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Your turn" value={myTurn.length} tone="warning" hint="Returns awaiting you" />
        <Kpi label="Awaiting client" value={waitingClient.length} tone="info" hint="Blocked on client input" />
        <Kpi label="In review" value={inReview.length} tone="ai" hint="With Priya Shah" />
        <Kpi label="Filed YTD" value={returns.filter(r=>r.status==="filed").length} tone="verified" hint="Season progress" />
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Do this next</h2>
        <Card className="divide-y">
          {myTurn.slice(0, 6).map(r => {
            const meta = statusMeta[r.status];
            return (
              <Link key={r.id} to="/returns/$id" params={{ id: r.id }} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                <PriorityDot p={r.priority} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium truncate">{r.clientName}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground truncate">{r.form}</span>
                    <StatusBadge status={r.status} className="ml-1" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    Next: {r.nextAction} · due {r.dueDate}
                  </div>
                </div>
                <div className="hidden md:block w-40">
                  <Progress value={r.progress} />
                  <div className="text-[10px] text-muted-foreground mt-1">{meta.label} · {r.progress}%</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            );
          })}
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Waiting on client</h2>
          <Card className="divide-y">
            {waitingClient.map(r => (
              <div key={r.id} className="p-3 flex items-center gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.clientName}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.nextAction}</div>
                </div>
                <Badge className="chip-warning gap-1"><Clock className="h-3 w-3" />{daysUntil(r.dueDate)}d</Badge>
                <Button variant="ghost" size="sm" asChild><Link to="/returns/$id/messages" params={{ id: r.id }}>Nudge</Link></Button>
              </div>
            ))}
          </Card>
        </section>
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Team pulse</h2>
          <Card className="p-4 space-y-3 text-sm">
            <Row icon={<UsersIcon className="h-4 w-4 text-muted-foreground" />} label="Reviewer queue" value={String(inReview.length)} />
            <Row icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />} label="Open threads" value={String(threads.filter(t=>t.status!=="resolved").length)} />
            <Row icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} label="Avg. turnaround" value="3.4d" />
          </Card>
        </section>
      </div>
    </div>
  );
}

/* ---------------- Firm admin dashboard ---------------- */
function FirmDashboard() {
  const activeReturns = returns.filter(r => r.status !== "filed").length;
  const filed = returns.filter(r => r.status === "filed").length;
  const outstanding = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter(i => i.status === "overdue");
  const activeStaff = staff.filter(s => s.status === "active").length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px]">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Firm dashboard</h1>
          <p className="text-sm text-muted-foreground">Everything across every preparer and client. Season starts to peak next week.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" asChild><Link to="/firm/billing"><Landmark className="h-4 w-4 mr-1.5" />Billing</Link></Button>
          <Button size="sm" asChild><Link to="/firm/staff"><UsersIcon className="h-4 w-4 mr-1.5" />Manage staff</Link></Button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Active returns" value={activeReturns} tone="info" hint={`${filed} filed YTD`} />
        <Kpi label="Active staff" value={activeStaff} tone="verified" hint="Preparers + reviewers" />
        <Kpi label="Outstanding" value={fmt$(outstanding)} tone="warning" hint={`${overdue.length} overdue`} />
        <Kpi label="Clients" value={new Set(returns.map(r=>r.clientName)).size} tone="ai" hint="On the platform" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Staff utilization</h2>
            <Link to="/firm/staff" className="text-xs text-accent hover:underline">Manage →</Link>
          </div>
          <Card className="divide-y">
            {staff.filter(s => s.status === "active").map(s => (
              <div key={s.id} className="p-3 flex items-center gap-3 text-sm">
                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">{s.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{roleLabel(s.role)} · {s.activeReturns} active</div>
                </div>
                <div className="w-32">
                  <Progress value={s.utilization} />
                  <div className="text-[10px] text-muted-foreground mt-1 text-right">{s.utilization}% util.</div>
                </div>
              </div>
            ))}
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Attention needed</h2>
          <Card className="p-4 space-y-3 text-sm">
            {overdue.map(i => (
              <div key={i.id} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{i.clientName}</div>
                  <div className="text-xs text-muted-foreground">Invoice {i.id} · {fmt$(i.amount)} · overdue since {i.due}</div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border/60">
              <Link to="/firm/billing" className="text-xs text-accent hover:underline">See all invoices →</Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function roleLabel(r: string) {
  if (r === "preparer") return "Preparer";
  if (r === "reviewer") return "Reviewer";
  if (r === "seasonal_staff") return "Seasonal";
  if (r === "firm_admin") return "Admin";
  return r;
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex-1">{label}</div>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function Kpi({ label, value, tone, hint }: { label: string; value: number | string; tone: "info"|"warning"|"verified"|"ai"; hint: string }) {
  const cls = tone === "info" ? "chip-info" : tone === "warning" ? "chip-warning" : tone === "verified" ? "chip-verified" : "chip-ai";
  return (
    <Card className="p-4">
      <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}>{label}</div>
      <div className="mt-2 text-3xl font-semibold font-mono">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </Card>
  );
}

function PriorityDot({ p }: { p: "urgent"|"high"|"normal"|"low" }) {
  const map = { urgent: "bg-destructive", high: "bg-warning", normal: "bg-info", low: "bg-muted-foreground/50" } as const;
  return <span className={`h-2 w-2 rounded-full shrink-0 ${map[p]}`} title={p} />;
}

function daysUntil(iso: string) {
  return Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
}

import type { ReactNode } from "react";

/* ---------------- Individual client home ---------------- */
function ClientHome() {
  const myReturn = returns.find(r => r.clientName === "Jamie Chen")!;
  const myNeeded = neededDocs.filter(d => d.returnId === myReturn.id);
  const waiting = myNeeded.filter(d => d.status === "waiting");
  const done = onboarding.filter(o => o.status === "done").length;
  const current = onboarding.find(o => o.status === "current");
  const pct = Math.round((done / onboarding.length) * 100);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Welcome, Jamie</p>
        <h1 className="text-3xl font-serif">Let's finish your 2024 return.</h1>
        <p className="text-sm text-muted-foreground">
          Your preparer <b>Morgan Ellis, CPA</b> is on it. You have <b>{waiting.length + 2} things</b> to do — about 10 minutes total.
        </p>
      </header>

      {current && (
        <Card className="p-5 border-accent/40 bg-accent/5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
              <Upload className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-accent font-semibold">Do this next</div>
              <div className="text-lg font-semibold mt-1">{current.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{current.detail}</p>
            </div>
            <Button asChild><Link to="/documents">Start<ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
          </div>
        </Card>
      )}

      {/* Docs still needed */}
      {waiting.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">We still need</h2>
          <Card className="divide-y">
            {waiting.map(d => (
              <div key={d.id} className="p-3 flex items-center gap-3 text-sm">
                <Circle className="h-4 w-4 text-warning" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{d.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{d.reason}</div>
                </div>
                <Button size="sm" variant="secondary" asChild><Link to="/documents">Upload</Link></Button>
              </div>
            ))}
          </Card>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your setup</h2>
          <span className="text-xs text-muted-foreground">{done} of {onboarding.length} · {pct}%</span>
        </div>
        <Progress value={pct} className="mb-3" />
        <Card className="divide-y">
          {onboarding.map(o => (
            <div key={o.id} className="p-3 flex items-center gap-3">
              {o.status === "done" ? <CheckCircle2 className="h-4 w-4 text-verified" /> :
               o.status === "current" ? <Circle className="h-4 w-4 text-accent fill-accent/20" /> :
               <Circle className="h-4 w-4 text-muted-foreground/50" />}
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${o.status === "done" ? "text-muted-foreground line-through" : "font-medium"}`}>{o.title}</div>
                <div className="text-xs text-muted-foreground">{o.detail}</div>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{o.eta}</span>
            </div>
          ))}
        </Card>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your 2024 return</h2>
        <Card className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-muted-foreground">{myReturn.form} · {myReturn.id}</div>
              <div className="mt-1"><StatusBadge status={myReturn.status} /></div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Estimated refund</div>
              <div className="text-2xl font-semibold font-mono text-verified">{fmt$(myReturn.refund)}</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={myReturn.progress} />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress {myReturn.progress}%</span>
              <span>Filing deadline · {myReturn.dueDate}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" asChild><Link to="/return">See details</Link></Button>
            <Button variant="ghost" asChild><Link to="/inbox">Message Morgan</Link></Button>
          </div>
        </Card>
      </section>

      <p className="text-xs text-muted-foreground text-center">
        Nothing you do here is final — you'll review and approve every number before it's filed.
      </p>
    </div>
  );
}
