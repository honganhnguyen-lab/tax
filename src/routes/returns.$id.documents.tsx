import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { documents, users, type DocKind } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Upload, FileText, ShieldCheck, Sparkles, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/returns/$id/documents")({
  component: Documents,
});

const kinds: (DocKind | "All")[] = ["All","W-2","1099-INT","1099-DIV","Bank Stmt","Receipt","Other"];

function Documents() {
  const { id } = Route.useParams();
  const all = documents.filter(d => d.returnId === id);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<DocKind | "All">("All");
  const [statusFilter, setStatusFilter] = useState<"all"|"verified"|"ai_extracted"|"needs_review"|"pending_upload">("all");

  const filtered = useMemo(() => all.filter(d =>
    (kind === "All" || d.kind === kind) &&
    (statusFilter === "all" || d.status === statusFilter) &&
    (q === "" || d.name.toLowerCase().includes(q.toLowerCase()) || (d.issuer ?? "").toLowerCase().includes(q.toLowerCase()))
  ), [all, kind, q, statusFilter]);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Documents</h2>
          <p className="text-xs text-muted-foreground">{all.length} total · showing {filtered.length}</p>
        </div>
        <Button size="sm"><Upload className="h-4 w-4 mr-1.5" />Upload documents</Button>
      </header>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or issuer…" className="pl-8 h-9 w-72" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {kinds.map(k => (
            <button key={k} onClick={()=>setKind(k)} className={pill(kind === k)}>{k}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-1.5 text-xs">
        {(["all","verified","ai_extracted","needs_review","pending_upload"] as const).map(s => (
          <button key={s} onClick={()=>setStatusFilter(s)} className={cn("px-2.5 py-1 rounded-md border", statusFilter===s ? "bg-secondary border-secondary" : "border-border text-muted-foreground")}>
            {s === "all" ? "Any status" : s.replace("_"," ")} ({s === "all" ? all.length : all.filter(x=>x.status===s).length})
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="max-h-[560px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground sticky top-0">
              <tr>
                <th className="text-left px-4 py-2">Document</th>
                <th className="text-left px-4 py-2">Kind</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Pages</th>
                <th className="text-left px-4 py-2">Uploaded</th>
                <th className="text-left px-4 py-2">By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{d.name}</div>
                        {d.issuer && <div className="text-xs text-muted-foreground">{d.issuer}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><Badge variant="outline" className="font-mono text-[10px]">{d.kind}</Badge></td>
                  <td className="px-4 py-2.5"><DocStatusChip status={d.status} /></td>
                  <td className="px-4 py-2.5 font-mono text-xs">{d.pages}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{d.uploadedAt}</td>
                  <td className="px-4 py-2.5 text-xs">{users[d.uploadedBy].name.split(" ")[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function pill(active: boolean) {
  return `text-xs px-2.5 py-1 rounded-full border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"}`;
}

function DocStatusChip({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
    verified: { cls: "chip-verified", label: "Verified", icon: <ShieldCheck className="h-3 w-3" /> },
    ai_extracted: { cls: "chip-ai", label: "AI extracted", icon: <Sparkles className="h-3 w-3" /> },
    needs_review: { cls: "chip-warning", label: "Needs review", icon: <AlertCircle className="h-3 w-3" /> },
    pending_upload: { cls: "chip-locked", label: "Pending", icon: <Clock className="h-3 w-3" /> },
  };
  const m = map[status];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", m.cls)}>{m.icon}{m.label}</span>;
}
