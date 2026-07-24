import { Link, useRouter, useRouterState, type LinkProps } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LayoutDashboard, FileText, Inbox, CheckSquare, Users, Search, Command, Bell,
  ChevronRight, Building2, Scale, Sparkles, User, ClipboardList, PenLine, Receipt,
  Settings, ChevronDown, ShieldCheck, Briefcase, Landmark,
} from "lucide-react";
import { useRole } from "@/lib/role-context";
import { users, roleMeta, type Role } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NavItem = { to: LinkProps["to"]; label: string; icon: ReactNode; exact?: boolean };

const navByRole: Record<Role, NavItem[]> = {
  client_individual: [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, exact: true },
    { to: "/profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { to: "/questionnaire", label: "Questionnaire", icon: <ClipboardList className="h-4 w-4" /> },
    { to: "/documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
    { to: "/return", label: "My return", icon: <Receipt className="h-4 w-4" /> },
    { to: "/inbox", label: "Messages", icon: <Inbox className="h-4 w-4" /> },
    { to: "/return/sign", label: "Review & sign", icon: <PenLine className="h-4 w-4" /> },
  ],
  client_business: [
    { to: "/design/business-owner", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, exact: true },
  ],
  preparer: [
    { to: "/", label: "Queue", icon: <LayoutDashboard className="h-4 w-4" />, exact: true },
    { to: "/returns", label: "Returns", icon: <FileText className="h-4 w-4" /> },
    { to: "/clients", label: "Clients", icon: <Users className="h-4 w-4" /> },
    { to: "/inbox", label: "Inbox", icon: <Inbox className="h-4 w-4" /> },
    { to: "/tasks", label: "Tasks", icon: <CheckSquare className="h-4 w-4" /> },
  ],
  reviewer: [
    { to: "/design/reviewer", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, exact: true },
  ],
  firm_admin: [
    { to: "/", label: "Firm dashboard", icon: <LayoutDashboard className="h-4 w-4" />, exact: true },
    { to: "/firm/staff", label: "Staff", icon: <Users className="h-4 w-4" /> },
    { to: "/clients", label: "Clients", icon: <Briefcase className="h-4 w-4" /> },
    { to: "/returns", label: "Returns", icon: <FileText className="h-4 w-4" /> },
    { to: "/firm/billing", label: "Billing", icon: <Landmark className="h-4 w-4" /> },
    { to: "/firm/settings", label: "Firm settings", icon: <Settings className="h-4 w-4" /> },
  ],
  seasonal_staff: [
    { to: "/design/seasonal-staff", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, exact: true },
  ],
};

const roleUser: Record<Role, keyof typeof users> = {
  client_individual: "u_client",
  client_business: "u_client",
  preparer: "u_cpa",
  reviewer: "u_reviewer",
  firm_admin: "u_admin",
  seasonal_staff: "u_seasonal",
};

export function AppShell({ children }: { children: ReactNode }) {
  const { activeRole } = useRole();
  const nav = navByRole[activeRole];
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const me = users[roleUser[activeRole]];

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-4 h-14 flex items-center gap-2 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-md bg-sidebar-primary/20 flex items-center justify-center">
            <Scale className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Ledgerline</div>
            <div className="text-[10px] uppercase tracking-wider opacity-60">Tax Platform</div>
          </div>
        </div>
        <nav className="p-2 flex-1">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(String(item.to));
            return (
              <Link
                key={String(item.to)}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="rounded-md bg-sidebar-accent/60 p-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-semibold">
                {me.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{me.name}</div>
                <div className="text-[11px] opacity-70 truncate">{me.title}</div>
              </div>
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-wider opacity-70">
              Signed in as {roleMeta[activeRole].label}
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <Breadcrumbs />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function TopBar() {
  const { activeRole } = useRole();
  const isClient = activeRole === "client_individual" || activeRole === "client_business";
  return (
    <header className="h-14 border-b border-border bg-card/60 backdrop-blur px-4 flex items-center gap-3 sticky top-0 z-30">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          className="w-full h-9 pl-9 pr-16 rounded-md bg-secondary text-sm text-secondary-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={isClient ? "Search your documents and messages…" : "Search returns, clients, documents…"}
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <Command className="h-3 w-3" /> K
        </kbd>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <RoleSwitcher />
        {activeRole === "preparer" && (
          <Badge className="chip-ai gap-1 hidden sm:inline-flex"><Sparkles className="h-3 w-3" /> AI copilot on</Badge>
        )}
        <Button variant="ghost" size="icon" aria-label="Notifications" className="hidden sm:inline-flex"><Bell className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" aria-label="Firm" className="hidden sm:inline-flex"><Building2 className="h-4 w-4" /></Button>
      </div>
    </header>
  );
}

function RoleSwitcher() {
  const { activeRole, setActiveRole } = useRole();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const roles: Role[] = ["client_individual", "client_business", "preparer", "reviewer", "firm_admin", "seasonal_staff"];
  const clientRoles = roles.filter(r => roleMeta[r].group === "Client");
  const staffRoles = roles.filter(r => roleMeta[r].group === "Staff");
  const current = roleMeta[activeRole];

  const pick = (r: Role) => {
    setActiveRole(r);
    setOpen(false);
    router.navigate({ to: roleMeta[r].landing });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary hover:bg-secondary/70 px-2.5 py-1.5 text-xs"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">{current.label}</span>
        {!current.built && <Badge variant="outline" className="text-[9px] px-1 py-0 border-accent/40 text-accent">design</Badge>}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-72 rounded-md border border-border bg-popover text-popover-foreground shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2">View as</div>
          </div>
          <RoleGroup label="Clients" roles={clientRoles} activeRole={activeRole} onPick={pick} />
          <RoleGroup label="Staff" roles={staffRoles} activeRole={activeRole} onPick={pick} />
          <div className="p-2 border-t border-border text-[10px] text-muted-foreground">
            Roles marked <span className="text-accent font-medium">design</span> are non-interactive previews.
          </div>
        </div>
      )}
    </div>
  );
}

function RoleGroup({ label, roles, activeRole, onPick }: { label: string; roles: Role[]; activeRole: Role; onPick: (r: Role) => void }) {
  return (
    <div className="py-1">
      <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {roles.map(r => {
        const m = roleMeta[r];
        const isActive = r === activeRole;
        return (
          <button
            key={r}
            onClick={() => onPick(r)}
            className={cn(
              "w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-muted/60 transition-colors",
              isActive && "bg-muted/50"
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-sm">
                <span className={cn("font-medium truncate", isActive && "text-accent")}>{m.label}</span>
                {!m.built && <Badge variant="outline" className="text-[9px] px-1 py-0 border-accent/40 text-accent">design</Badge>}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">{m.tagline}</div>
            </div>
            {isActive && <span className="text-[10px] text-accent mt-1">Active</span>}
          </button>
        );
      })}
    </div>
  );
}

function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/") return null;
  const parts = pathname.split("/").filter(Boolean);
  return (
    <div className="px-4 sm:px-6 py-2 text-xs text-muted-foreground border-b border-border/60 bg-background/40">
      <ol className="flex items-center gap-1">
        <li><Link to="/" className="hover:text-foreground">Home</Link></li>
        {parts.map((p, i) => {
          const href = "/" + parts.slice(0, i + 1).join("/");
          const isLast = i === parts.length - 1;
          return (
            <li key={href} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              {isLast ? (
                <span className="text-foreground">{decodeURIComponent(p)}</span>
              ) : (
                <Link to={href as LinkProps["to"]} className="hover:text-foreground">{decodeURIComponent(p)}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
