import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { threads, users, documents, fields, tasks, type Thread, type Visibility } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/lib/role-context";
import { Eye, EyeOff, Paperclip, Send, Link2, FileText, Hash, Lock, MessageSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/returns/$id/messages")({
  component: Messages,
});

function Messages() {
  const { id } = Route.useParams();
  const { role } = useRole();
  const list = threads.filter(t => t.returnId === id);
  const [selectedId, setSelectedId] = useState<string>(list[0]?.id ?? "");
  const [visibility, setVisibility] = useState<Visibility>(role === "client" ? "client" : "client");
  const [draft, setDraft] = useState("");
  const selected = list.find(t => t.id === selectedId);

  // Filter internal for clients
  const visibleThreads = list.filter(t => role === "cpa" ? true : t.messages.some(m => m.visibility === "client"));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] h-[calc(100vh-56px-32px-140px)] min-h-[500px]">
      <aside className="border-r border-border overflow-y-auto">
        <div className="p-3 border-b border-border sticky top-0 bg-background/95 backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Threads</div>
        </div>
        <ul>
          {visibleThreads.map(t => {
            const last = t.messages[t.messages.length - 1];
            const hasInternal = t.messages.some(m => m.visibility === "internal");
            return (
              <li key={t.id}>
                <button onClick={()=>setSelectedId(t.id)} className={cn(
                  "w-full text-left p-3 border-b border-border hover:bg-muted/40",
                  selectedId === t.id && "bg-muted/60"
                )}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium truncate">{t.subject}</div>
                    {role === "cpa" && hasInternal && <Lock className="h-3 w-3 text-internal" aria-label="Contains internal notes" />}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <ContextBadge thread={t} />
                    <ThreadStatusChip status={t.status} />
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-1">{last.body}</div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="flex flex-col overflow-hidden">
        {selected ? (
          <>
            <header className="p-4 border-b border-border">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{selected.subject}</h3>
                    <ThreadStatusChip status={selected.status} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                    Context: <ContextBadge thread={selected} link />
                    <span>·</span>
                    Owner: <span className="font-medium text-foreground">{users[selected.owner].name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {role === "cpa" && <Button size="sm" variant="secondary"><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Mark resolved</Button>}
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {selected.messages
                .filter(m => role === "cpa" ? true : m.visibility === "client")
                .map(m => {
                  const author = users[m.author];
                  const mine = (role === "cpa" && m.author === "u_cpa") || (role === "client" && m.author === "u_client");
                  return (
                    <div key={m.id} className={cn("flex gap-2", mine && "flex-row-reverse")}>
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shrink-0">{author.initials}</div>
                      <div className={cn("max-w-[75%] space-y-1", mine && "items-end flex flex-col")}>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="font-medium">{author.name}</span>
                          {m.visibility === "internal"
                            ? <Badge className="chip-internal gap-1 text-[9px]"><EyeOff className="h-2.5 w-2.5" />Internal · firm only</Badge>
                            : <Badge className="chip-info gap-1 text-[9px]"><Eye className="h-2.5 w-2.5" />Client-visible</Badge>}
                        </div>
                        <div className={cn(
                          "rounded-2xl px-3.5 py-2 text-sm border",
                          m.visibility === "internal"
                            ? "bg-internal/10 border-internal/30 text-foreground"
                            : mine
                              ? "bg-accent text-accent-foreground border-transparent"
                              : "bg-card border-border"
                        )}>
                          {m.body}
                        </div>
                      </div>
                    </div>
                  );
              })}
            </div>

            <footer className="p-3 border-t border-border bg-card">
              {role === "cpa" && (
                <div className="flex items-center gap-1 mb-2">
                  <button onClick={()=>setVisibility("client")} className={cn("text-xs px-2.5 py-1 rounded-md border inline-flex items-center gap-1", visibility==="client" ? "bg-info/10 border-info text-info" : "border-border text-muted-foreground")}>
                    <Eye className="h-3 w-3" />Client-visible
                  </button>
                  <button onClick={()=>setVisibility("internal")} className={cn("text-xs px-2.5 py-1 rounded-md border inline-flex items-center gap-1", visibility==="internal" ? "chip-internal" : "border-border text-muted-foreground")}>
                    <EyeOff className="h-3 w-3" />Internal note
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-end">
                <Textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={2}
                  placeholder={visibility === "internal" ? "Internal note — not visible to client" : role === "client" ? "Reply to Morgan…" : "Reply to Jamie…"}
                  className={cn(visibility === "internal" && role === "cpa" && "border-internal/50 bg-internal/5")}
                />
                <Button size="icon" disabled={!draft.trim()} onClick={()=>setDraft("")}><Send className="h-4 w-4" /></Button>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5">
                {visibility === "internal"
                  ? "Only your firm sees internal notes. Jamie will never see this."
                  : "Jamie will be notified by email and in-app."}
              </div>
            </footer>
          </>
        ) : (
          <div className="p-8 text-sm text-muted-foreground">Select a thread.</div>
        )}
      </section>
    </div>
  );
}

function ThreadStatusChip({ status }: { status: Thread["status"] }) {
  const map = {
    open: { cls: "chip-info", label: "Open" },
    waiting_client: { cls: "chip-warning", label: "Waiting on client" },
    waiting_cpa: { cls: "chip-ai", label: "Waiting on you" },
    resolved: { cls: "chip-verified", label: "Resolved" },
  } as const;
  const m = map[status];
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", m.cls)}>{m.label}</span>;
}

function ContextBadge({ thread, link }: { thread: Thread; link?: boolean }) {
  const { id } = { id: thread.returnId };
  const icon = thread.contextType === "document" ? <FileText className="h-3 w-3" /> :
               thread.contextType === "field" ? <Hash className="h-3 w-3" /> :
               thread.contextType === "task" ? <CheckCircle2 className="h-3 w-3" /> :
               <MessageSquare className="h-3 w-3" />;
  const target: any = thread.contextType === "document" ? { to: "/returns/$id/documents", params: { id } } :
                      thread.contextType === "field" ? { to: "/returns/$id/review", params: { id } } :
                      { to: "/returns/$id/tasks", params: { id } };
  const inner = <span className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px]">{icon}{thread.contextLabel ?? thread.contextType}</span>;
  return link ? <Link {...target}>{inner}</Link> : inner;
}
