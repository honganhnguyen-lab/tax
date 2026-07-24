import { createFileRoute, Link } from "@tanstack/react-router";
import { documents, returns } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/documents")({
  component: DocumentsIndex,
});

function DocumentsIndex() {
  // For client view — assume Jamie Chen
  const clientReturn = returns.find(r => r.clientName === "Jamie Chen")!;
  const docs = documents.filter(d => d.returnId === clientReturn.id);
  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-1">Your documents</h1>
      <p className="text-sm text-muted-foreground mb-4">Everything you've shared with your preparer, in one place.</p>
      <Card className="divide-y">
        {docs.map(d => (
          <Link key={d.id} to="/returns/$id/documents" params={{ id: d.returnId }} className="flex items-center gap-3 p-3 hover:bg-muted/40">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{d.name}</div>
              <div className="text-xs text-muted-foreground">{d.kind} · {d.pages}p · uploaded {d.uploadedAt}</div>
            </div>
          </Link>
        ))}
      </Card>
    </div>
  );
}
