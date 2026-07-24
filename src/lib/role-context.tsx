import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toLegacyRole, type LegacyRole, type Role } from "@/data/mock";

interface Ctx {
  /** Legacy binary role kept for existing components: "cpa" | "client". */
  role: LegacyRole;
  /** Extended role for the redesign. */
  activeRole: Role;
  setActiveRole: (r: Role) => void;
}

const RoleContext = createContext<Ctx>({
  role: "client",
  activeRole: "client_individual",
  setActiveRole: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRoleState] = useState<Role>("client_individual");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("app.role.v2") as Role | null;
    const valid: Role[] = [
      "client_individual",
      "client_business",
      "preparer",
      "reviewer",
      "firm_admin",
      "seasonal_staff",
    ];
    if (saved && valid.includes(saved)) setActiveRoleState(saved);
  }, []);
  const setActiveRole = (r: Role) => {
    setActiveRoleState(r);
    if (typeof window !== "undefined") window.localStorage.setItem("app.role.v2", r);
  };
  return (
    <RoleContext.Provider value={{ role: toLegacyRole(activeRole), activeRole, setActiveRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
