import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { returns, statusMeta, fmt$, type ReturnStatus } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ArrowUpDown } from "lucide-react";

export const Route = createFileRoute("/returns/")({
  head: () => ({
    meta: [
      { title: "Returns · Ledgerline" },
      { name: "description", content: "All active tax returns with status, ownership, and next actions." },
      { property: "og:title", content: "Returns · Ledgerline" },
      { property: "og:description", content: "All active tax returns with status, ownership, and next actions." },
    ],
  }),
  component: ReturnsList,
});

const statuses: ReturnStatus[] = ["not_started","collecting_docs","in_preparation","awaiting_client","in_review","ready_to_file","filed"];

function ReturnsList() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ReturnStatus | "all">("all");
  const list = useMemo(() => returns.filter(r =>
    (filter === "all" || r.status === filter) &&
    (q === "" || r.clientName.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase()))
  ), [q, filter]);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1400px]">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Returns</h1>
          <p className="text-sm text-muted-foreground">{returns.length} total · {returns.filter(r=>r.status!=="filed").length} active</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" className="pl-8 h-9 w-64" />
          </div>
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1.5" />More filters</Button>
        </div>
      </header>

      <div className="flex gap-1.5 flex-wrap">
        <button onClick={()=>setFilter("all")} className={pill(filter==="all")}>All ({returns.length})</button>
        {statuses.map(s => (
          <button key={s} onClick={()=>setFilter(s)} className={pill(filter===s)}>
            {statusMeta[s].label} ({returns.filter(r=>r.status===s).length})
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2">Client / ID</th>
              <th className="text-left px-4 py-2">Form</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Next action</th>
              <th className="text-left px-4 py-2">Owner</th>
              <th className="text-right px-4 py-2">Refund / Due</th>
              <th className="text-left px-4 py-2"><span className="inline-flex items-center gap-1">Deadline <ArrowUpDown className="h-3 w-3" /></span></th>
            </tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link to="/returns/$id" params={{ id: r.id }} className="font-medium hover:underline">{r.clientName}</Link>
                  <div className="text-xs text-muted-foreground font-mono">{r.id} · {r.entity}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.form}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{r.nextAction}</td>
                <td className="px-4 py-3 text-xs">{r.nextActionOwner === "u_client" ? "Client" : r.nextActionOwner === "u_reviewer" ? "Reviewer" : "You"}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {r.refund ? <span className="text-verified">+{fmt$(r.refund)}</span> :
                   r.balanceDue ? <span className="text-destructive">−{fmt$(r.balanceDue)}</span> : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function pill(active: boolean) {
  return `text-xs px-3 py-1.5 rounded-full border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"}`;
}
