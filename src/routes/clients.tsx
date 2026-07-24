import { createFileRoute, Link } from "@tanstack/react-router";
import { returns } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/clients")({
  component: Clients,
});

function Clients() {
  const byClient = new Map<string, typeof returns>();
  returns.forEach(r => {
    if (!byClient.has(r.clientName)) byClient.set(r.clientName, [] as any);
    byClient.get(r.clientName)!.push(r);
  });
  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Clients</h1>
      <Card className="divide-y">
        {Array.from(byClient.entries()).map(([name, rs]) => (
          <div key={name} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{name}</div>
                <div className="text-xs text-muted-foreground">{rs[0].entity} · {rs.length} return{rs.length>1?"s":""}</div>
              </div>
              <div className="flex gap-2">
                {rs.map(r => (
                  <Link key={r.id} to="/returns/$id" params={{ id: r.id }} className="text-xs inline-flex items-center gap-1.5 border border-border rounded px-2 py-1 hover:bg-muted/40">
                    <span className="font-mono">{r.id}</span>
                    <StatusBadge status={r.status} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
