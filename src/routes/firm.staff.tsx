import { createFileRoute } from "@tanstack/react-router";
import { staff, roleMeta, type Role } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserPlus, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/firm/staff")({
  component: Staff,
});

function Staff() {
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1400px]">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Staff</h2>
          <p className="text-xs text-muted-foreground">{staff.length} people · assign clients, change roles, invite seasonal help.</p>
        </div>
        <Button size="sm"><UserPlus className="h-4 w-4 mr-1.5" />Invite staff</Button>
      </header>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2">Person</th>
              <th className="text-left px-4 py-2">Role</th>
              <th className="text-left px-4 py-2">Active returns</th>
              <th className="text-left px-4 py-2">Utilization</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} className="border-t border-border hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">{s.initials}</div>
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{roleMeta[s.role as Role].label}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{s.activeReturns}</td>
                <td className="px-4 py-3 w-40">
                  <Progress value={s.utilization} />
                  <div className="text-[10px] text-muted-foreground mt-1">{s.utilization}%</div>
                </td>
                <td className="px-4 py-3">
                  <StaffStatus status={s.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function StaffStatus({ status }: { status: "active" | "invited" | "off_season" }) {
  const cls = status === "active" ? "chip-verified" : status === "invited" ? "chip-info" : "chip-locked";
  const label = status === "active" ? "Active" : status === "invited" ? "Invited" : "Off season";
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}>{label}</span>;
}
