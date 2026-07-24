import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Users, Landmark, Settings } from "lucide-react";

export const Route = createFileRoute("/firm")({
  head: () => ({
    meta: [
      { title: "Firm · Ledgerline" },
      { name: "description", content: "Manage staff, billing, and firm-wide settings." },
      { property: "og:title", content: "Firm · Ledgerline" },
      { property: "og:description", content: "Manage staff, billing, and firm-wide settings." },
    ],
  }),
  component: FirmLayout,
});

function FirmLayout() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const tabs = [
    { to: "/firm/staff", label: "Staff", icon: <Users className="h-3.5 w-3.5" /> },
    { to: "/firm/billing", label: "Billing", icon: <Landmark className="h-3.5 w-3.5" /> },
    { to: "/firm/settings", label: "Settings", icon: <Settings className="h-3.5 w-3.5" /> },
  ];
  return (
    <div>
      <div className="border-b border-border bg-card/60 px-4 sm:px-6 py-4">
        <h1 className="text-xl font-semibold">Firm administration</h1>
        <p className="text-sm text-muted-foreground">Manage people, invoices, and firm-wide policies.</p>
        <nav className="mt-3 flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(t => {
            const active = pathname === t.to || pathname.startsWith(t.to + "/");
            return (
              <Link key={t.to} to={t.to} className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-md border-b-2 -mb-px transition-colors",
                active ? "border-accent text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
                {t.icon}{t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
