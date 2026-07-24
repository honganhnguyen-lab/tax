import { Badge } from "@/components/ui/badge";
import { statusMeta, type ReturnStatus } from "@/data/mock";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

const toneClass = {
  info: "chip-info",
  warning: "chip-warning",
  verified: "chip-verified",
  locked: "chip-locked",
  ai: "chip-ai",
} as const;

export function StatusBadge({ status, className }: { status: ReturnStatus; className?: string }) {
  const { role } = useRole();
  const meta = statusMeta[status];
  const label = role === "client" ? meta.clientLabel : meta.label;
  return <Badge className={cn(toneClass[meta.tone], "font-medium", className)}>{label}</Badge>;
}
