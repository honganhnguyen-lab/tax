import { createFileRoute, Link } from "@tanstack/react-router";
import { tasks, returns, users } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/lib/role-context";
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  component: TasksIndex,
});

function TasksIndex() {
  const { role } = useRole();
  const list = tasks.filter(t => role === "client" ? t.owner === "u_client" : true);
  const open = list.filter(t => t.status !== "done");
  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-1">{role === "client" ? "Your to-do" : "All open tasks"}</h1>
      <p className="text-sm text-muted-foreground mb-4">{open.length} open · sorted by due date</p>
      <Card className="divide-y">
        {open.sort((a,b) => (a.due ?? "9999").localeCompare(b.due ?? "9999")).map(t => {
          const r = returns.find(x => x.id === t.returnId);
          return (
            <Link key={t.id} to="/returns/$id/tasks" params={{ id: t.returnId }} className="p-4 flex items-center gap-3 hover:bg-muted/40">
              {t.status === "waiting" ? <Clock className="h-4 w-4 text-warning" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{t.title}</div>
                <div className="text-xs text-muted-foreground">{r?.clientName} · {r?.form} · owner {users[t.owner].name}</div>
              </div>
              {t.due && <Badge variant="outline" className="text-[10px]">Due {t.due}</Badge>}
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}
      </Card>
    </div>
  );
}
