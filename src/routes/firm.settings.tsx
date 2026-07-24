import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Palette, Shield } from "lucide-react";

export const Route = createFileRoute("/firm/settings")({
  component: FirmSettings,
});

function FirmSettings() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
      <Card className="p-5 space-y-4">
        <SectionHeader icon={<Palette className="h-4 w-4" />} title="Branding" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Firm name" value="Ledgerline CPA Group" />
          <Field label="Primary contact" value="Dana Whitfield" />
          <Field label="Support email" value="support@ledgerline.co" />
          <Field label="Phone" value="(415) 555-0193" />
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <SectionHeader icon={<FileText className="h-4 w-4" />} title="Engagement letter templates" />
        <ul className="divide-y">
          {[
            { name: "Individual 1040 — Standard", version: "v4.2", updated: "2025-01-04" },
            { name: "S-Corp 1120-S — Standard", version: "v3.1", updated: "2024-12-11" },
            { name: "Partnership 1065 — Standard", version: "v2.7", updated: "2024-11-30" },
          ].map(t => (
            <li key={t.name} className="py-3 flex items-center gap-3 text-sm">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.version} · updated {t.updated}</div>
              </div>
              <Button variant="ghost" size="sm">Edit</Button>
            </li>
          ))}
        </ul>
        <Button size="sm" variant="secondary">New template</Button>
      </Card>

      <Card className="p-5 space-y-4">
        <SectionHeader icon={<Shield className="h-4 w-4" />} title="Firm-wide policies" />
        <ul className="divide-y text-sm">
          <PolicyRow name="Two-factor auth required for staff" on />
          <PolicyRow name="Client document downloads watermarked" on />
          <PolicyRow name="Reviewer sign-off required before filing" on />
          <PolicyRow name="Seasonal staff can e-file" />
        </ul>
      </Card>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input defaultValue={value} className="mt-1" />
    </div>
  );
}

function PolicyRow({ name, on }: { name: string; on?: boolean }) {
  return (
    <li className="py-3 flex items-center gap-3">
      <div className="flex-1">{name}</div>
      <Badge className={on ? "chip-verified" : "chip-locked"}>{on ? "On" : "Off"}</Badge>
    </li>
  );
}
