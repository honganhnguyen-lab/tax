import { createFileRoute, Link } from "@tanstack/react-router";
import { threads, returns } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inbox")({
  component: Inbox,
});

function Inbox() {
  const { role } = useRole();
  const list = threads.filter(t => role === "cpa" || t.messages.some(m => m.visibility === "client"));
  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-1">{role === "cpa" ? "Inbox" : "Messages"}</h1>
      <p className="text-sm text-muted-foreground mb-4">Every conversation is anchored to a return, document, or field.</p>
      <Card className="divide-y">
        {list.map(t => {
          const r = returns.find(x => x.id === t.returnId);
          const last = t.messages[t.messages.length - 1];
          return (
            <Link key={t.id} to="/returns/$id/messages" params={{ id: t.returnId }} className="flex items-center gap-4 p-4 hover:bg-muted/40">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{t.subject}</div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{last.body}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{r?.clientName} · {t.contextLabel}</div>
              </div>
              <span className={cn("text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full",
                t.status === "waiting_client" ? "chip-warning" :
                t.status === "resolved" ? "chip-verified" : "chip-info"
              )}>{t.status.replace("_"," ")}</span>
            </Link>
          );
        })}
      </Card>
    </div>
  );
}
