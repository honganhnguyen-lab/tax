import { createFileRoute, Link } from "@tanstack/react-router";
import { tasks, users, threads, documents, fields, type Task } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/lib/role-context";
import { CheckCircle2, Circle, Clock, Upload, HelpCircle, PenLine, ShieldCheck, MessageSquare, FileText, Hash, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/returns/$id/tasks")({
  component: Tasks,
});

const kindMeta = {
  upload: { icon: <Upload className="h-3.5 w-3.5" />, label: "Upload" },
  answer: { icon: <HelpCircle className="h-3.5 w-3.5" />, label: "Answer" },
  review: { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Review" },
  sign: { icon: <PenLine className="h-3.5 w-3.5" />, label: "Sign" },
  prepare: { icon: <PenLine className="h-3.5 w-3.5" />, label: "Prepare" },
} as const;

function Tasks() {
  const { id } = Route.useParams();
  const { role } = useRole();
  const list = tasks.filter(t => t.returnId === id);

  const mine = list.filter(t => (role === "client" ? t.owner === "u_client" : t.owner !== "u_client"));
  const others = list.filter(t => (role === "client" ? t.owner !== "u_client" : t.owner === "u_client"));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Your to-do{role === "cpa" ? " (firm)" : ""}</h2>
          <span className="text-xs text-muted-foreground">{mine.filter(t=>t.status!=="done").length} open</span>
        </div>
        <TaskList items={mine} id={id} highlight />
      </section>
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{role === "client" ? "With your preparer" : "With the client"}</h2>
          <span className="text-xs text-muted-foreground">{others.filter(t=>t.status!=="done").length} open</span>
        </div>
        <TaskList items={others} id={id} />
      </section>
    </div>
  );
}

function TaskList({ items, id, highlight }: { items: Task[]; id: string; highlight?: boolean }) {
  if (items.length === 0) return <Card className="p-8 text-sm text-muted-foreground text-center">Nothing here.</Card>;
  return (
    <Card className="divide-y">
      {items.map(t => (
        <div key={t.id} className={cn("p-4 flex items-center gap-4", highlight && t.status !== "done" && "bg-accent/5")}>
          {t.status === "done"
            ? <CheckCircle2 className="h-5 w-5 text-verified shrink-0" />
            : t.status === "waiting"
              ? <Clock className="h-5 w-5 text-warning shrink-0" />
              : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] gap-1">{kindMeta[t.kind].icon}{kindMeta[t.kind].label}</Badge>
              <span className={cn("font-medium text-sm", t.status === "done" && "line-through text-muted-foreground")}>{t.title}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span>Owner: {users[t.owner].name}</span>
              {t.due && <><span>·</span><span>Due {t.due}</span></>}
              {t.linkedFieldId && <>
                <span>·</span>
                <Link to="/returns/$id/review" params={{ id }} className="inline-flex items-center gap-1 hover:text-foreground"><Hash className="h-3 w-3" />Return line</Link>
              </>}
              {t.linkedDocId && <>
                <span>·</span>
                <Link to="/returns/$id/documents" params={{ id }} className="inline-flex items-center gap-1 hover:text-foreground"><FileText className="h-3 w-3" />Document</Link>
              </>}
              {t.linkedThreadId && <>
                <span>·</span>
                <Link to="/returns/$id/messages" params={{ id }} className="inline-flex items-center gap-1 hover:text-foreground"><MessageSquare className="h-3 w-3" />Thread</Link>
              </>}
            </div>
          </div>
          {t.status !== "done" && (
            <Link to="/returns/$id/messages" params={{ id }} className="text-sm text-accent inline-flex items-center gap-1 hover:underline">
              Open <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      ))}
    </Card>
  );
}
