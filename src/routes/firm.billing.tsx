import { createFileRoute } from "@tanstack/react-router";
import { invoices, fmt$ } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/firm/billing")({
  component: Billing,
});

function Billing() {
  const totals = {
    paid: invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0),
    sent: invoices.filter(i => i.status === "sent").reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0),
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1400px]">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Billing</h2>
          <p className="text-xs text-muted-foreground">Invoices & payment status per client.</p>
        </div>
        <Button size="sm">New invoice</Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Totals label="Paid this month" amount={totals.paid} tone="text-verified" />
        <Totals label="Outstanding" amount={totals.sent} tone="text-info" />
        <Totals label="Overdue" amount={totals.overdue} tone="text-destructive" />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2">Invoice</th>
              <th className="text-left px-4 py-2">Client</th>
              <th className="text-left px-4 py-2">Return</th>
              <th className="text-left px-4 py-2">Issued</th>
              <th className="text-left px-4 py-2">Due</th>
              <th className="text-right px-4 py-2">Amount</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(i => (
              <tr key={i.id} className="border-t border-border hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs">{i.id}</td>
                <td className="px-4 py-3 font-medium">{i.clientName}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{i.returnId ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{i.issued}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{i.due}</td>
                <td className="px-4 py-3 text-right font-mono">{fmt$(i.amount)}</td>
                <td className="px-4 py-3"><InvoiceStatus status={i.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Totals({ label, amount, tone }: { label: string; amount: number; tone: string }) {
  return (
    <Card className="p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 text-2xl font-semibold font-mono ${tone}`}>{fmt$(amount)}</div>
    </Card>
  );
}

function InvoiceStatus({ status }: { status: "paid" | "sent" | "overdue" | "draft" }) {
  const map: Record<string, string> = {
    paid: "chip-verified",
    sent: "chip-info",
    overdue: "chip-warning",
    draft: "chip-locked",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${map[status]}`}>{status}</span>;
}
