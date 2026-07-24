import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { returns, tasks, threads, documents, fmt$, users } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { notFound } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, FileText, MessageSquare, CheckSquare, LayoutDashboard, ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/returns/$id")({
  loader: ({ params }) => {
    const r = returns.find(x => x.id === params.id);
    if (!r) throw notFound();
    return { returnData: r };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.returnData.clientName} · ${loaderData.returnData.form}` : "Return · Ledgerline" },
      { name: "description", content: "Tax return workspace with source traceability, documents, messages, and tasks." },
      { property: "og:title", content: loaderData ? `${loaderData.returnData.clientName} · Ledgerline` : "Return · Ledgerline" },
      { property: "og:description", content: "Tax return workspace with source traceability and unified collaboration." },
    ],
  }),
  component: ReturnLayout,
});

function ReturnLayout() {
  const { returnData: r } = Route.useLoaderData();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const base = `/returns/${r.id}`;
  const openThreads = threads.filter(t => t.returnId === r.id && t.status !== "resolved").length;
  const openTasks = tasks.filter(t => t.returnId === r.id && t.status !== "done").length;
  const docCount = documents.filter(d => d.returnId === r.id).length;

  const tabs = [
    { to: base, label: "Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" />, count: undefined, exact: true },
    { to: `${base}/review`, label: "Review", icon: <ScanSearch className="h-3.5 w-3.5" />, count: undefined },
    { to: `${base}/documents`, label: "Documents", icon: <FileText className="h-3.5 w-3.5" />, count: docCount },
    { to: `${base}/messages`, label: "Messages", icon: <MessageSquare className="h-3.5 w-3.5" />, count: openThreads },
    { to: `${base}/tasks`, label: "Tasks", icon: <CheckSquare className="h-3.5 w-3.5" />, count: openTasks },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px-32px)]">
      <div className="border-b border-border bg-card/60 px-4 sm:px-6 py-4">
        <Link to="/returns" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to returns</Link>
        <div className="flex items-start justify-between flex-wrap gap-4 mt-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{r.clientName}</h1>
              <StatusBadge status={r.status} />
              <Badge variant="outline" className="font-mono text-[10px]">{r.id}</Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">{r.form} · TY{r.taxYear} · {r.entity} · Due {r.dueDate}</div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Next action</div>
              <div className="text-sm font-medium">{r.nextAction}</div>
              <div className="text-xs text-muted-foreground">Owner: {ownerLabel(r.nextActionOwner)}</div>
            </div>
            <div className="min-w-[160px]">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Progress</div>
              <Progress value={r.progress} className="mt-1.5" />
              <div className="text-xs text-muted-foreground mt-1">{r.progress}%</div>
            </div>
            {(r.refund || r.balanceDue) && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.refund ? "Refund" : "Balance due"}</div>
                <div className={cn("text-lg font-semibold font-mono", r.refund ? "text-verified" : "text-destructive")}>
                  {r.refund ? `+${fmt$(r.refund)}` : `−${fmt$(r.balanceDue)}`}
                </div>
              </div>
            )}
          </div>
        </div>
        <nav className="mt-4 flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(t => {
            const active = t.exact ? pathname === t.to : pathname === t.to || pathname.startsWith(t.to + "/");
            return (
              <Link key={t.to} to={t.to} className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-md border-b-2 -mb-px transition-colors",
                active ? "border-accent text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
                {t.icon}{t.label}
                {t.count != null && t.count > 0 && (
                  <span className={cn("ml-1 text-[10px] px-1.5 py-0.5 rounded-full", active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>{t.count}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}

function ownerLabel(id: string) {
  if (id === "u_cpa") return "You (Preparer)";
  if (id === "u_client") return "Client";
  if (id === "u_reviewer") return "Reviewer";
  return id;
}
