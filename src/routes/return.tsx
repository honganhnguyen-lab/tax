import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { returns, pastReturns, neededDocs, statusMeta, fmt$ } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight, PenLine } from "lucide-react";

export const Route = createFileRoute("/return")({
  head: () => ({
    meta: [
      { title: "My return · Ledgerline" },
      { name: "description", content: "Your current-year return status and full filing history." },
      { property: "og:title", content: "My return · Ledgerline" },
      { property: "og:description", content: "Your current-year return status and full filing history." },
    ],
  }),
  component: ReturnLayout,
});

function ReturnLayout() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  // Nested /return/sign renders inside its own layout — only show the summary at exactly /return
  if (pathname !== "/return") return <Outlet />;
  return <MyReturn />;
}

function MyReturn() {
  const myReturn = returns.find(r => r.clientName === "Jamie Chen")!;
  const needed = neededDocs.filter(d => d.returnId === myReturn.id);
  const received = needed.filter(d => d.status === "received").length;
  const waiting = needed.filter(d => d.status === "waiting");

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">My return</h1>
        <p className="text-sm text-muted-foreground">The 2024 return you're filing this year, plus every year you've filed with us.</p>
      </header>

      {/* Current year */}
      <Card className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Tax year 2024 · {myReturn.form}</div>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={myReturn.status} />
              <Badge variant="outline" className="font-mono text-[10px]">{myReturn.id}</Badge>
            </div>
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
            <span>Deadline · {myReturn.dueDate}</span>
          </div>
        </div>

        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          <MiniStat label="Documents received" value={`${received}/${needed.length}`} />
          <MiniStat label="Next step" value={statusMeta[myReturn.status].clientLabel} />
        </div>

        {myReturn.status === "ready_to_file" || myReturn.status === "in_review" || myReturn.status === "awaiting_client" ? (
          <div className="mt-5 pt-5 border-t border-border">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/return/sign"><PenLine className="h-4 w-4 mr-1.5" />Review & sign</Link>
            </Button>
          </div>
        ) : null}
      </Card>

      {/* Docs still waiting */}
      {waiting.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Documents we're still waiting for</h2>
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

      {/* History */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Filing history</h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Year</th>
                <th className="text-left px-4 py-2">Form</th>
                <th className="text-left px-4 py-2">Filed</th>
                <th className="text-left px-4 py-2">Result</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {pastReturns.map(r => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-4 py-2.5 font-medium">{r.taxYear}</td>
                  <td className="px-4 py-2.5">{r.form}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.filedOn}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {r.refund ? <span className="text-verified">+{fmt$(r.refund)} refund</span>
                              : <span className="text-destructive">−{fmt$(r.balanceDue)} owed</span>}
                  </td>
                  <td className="px-4 py-2.5"><Badge className="chip-verified gap-1"><CheckCircle2 className="h-3 w-3" />{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        Need something older? <span className="text-accent inline-flex items-center hover:underline cursor-pointer">Request archived returns <ArrowRight className="h-3 w-3 ml-0.5" /></span>
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3 bg-secondary/40">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-1">{value}</div>
    </div>
  );
}
