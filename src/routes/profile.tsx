import { createFileRoute } from "@tanstack/react-router";
import { clientProfile } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Landmark } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile · Ledgerline" },
      { name: "description", content: "Manage your name, address, filing status, and refund bank details." },
      { property: "og:title", content: "Your profile · Ledgerline" },
      { property: "og:description", content: "Manage your name, address, filing status, and refund bank details." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const p = clientProfile;
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <p className="text-sm text-muted-foreground">The basics we use on every return. Update once — it applies to your 2024 filing and future years.</p>
      </header>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Personal</h2>
          <Badge className="chip-verified gap-1"><ShieldCheck className="h-3 w-3" />Verified</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Legal name" value={p.legalName} />
          <Field label="Filing status" value={p.filingStatus} />
          <Field label="SSN" value={p.ssnMasked} />
          <Field label="Phone" value={p.phone} />
          <Field label="Email" value={p.email} className="sm:col-span-2" />
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Mailing address</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Field label="Street" value={p.address.line1} className="sm:col-span-4" />
          <Field label="City" value={p.address.city} className="sm:col-span-2" />
          <Field label="State" value={p.address.state} />
          <Field label="ZIP" value={p.address.zip} />
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Refund direct deposit</h2>
        </div>
        <p className="text-xs text-muted-foreground">If you're owed a refund, we'll deposit it here.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Bank" value={p.refundBank.bankName} />
          <Field label="Account type" value={p.refundBank.type} />
          <Field label="Routing #" value={p.refundBank.routingMasked} />
          <Field label="Account #" value={p.refundBank.accountMasked} />
        </div>
        <div className="pt-2">
          <Button size="sm" variant="secondary">Update bank details</Button>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} readOnly className="mt-1 bg-secondary/60" />
    </div>
  );
}
