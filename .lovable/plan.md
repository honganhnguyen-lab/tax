
# Ledgerline — Role-Based Redesign

Restructure the app around six user roles. Three get real, navigable UI. Three are represented as design-only placeholder screens that show the intent without wiring behavior.

## Role Model

Extend `Role` in `src/data/mock.ts` and the role switcher in the top bar:

```
client_individual    → build
client_business      → design-only (single placeholder view)
preparer             → build
reviewer             → design-only
firm_admin           → build
seasonal_staff       → design-only
```

The role switcher becomes a grouped dropdown (Clients / Staff) so all six are reachable, with "design preview" badges on the three non-built ones.

## What Each Built Role Sees

### 1. Individual Client (`client_individual`) — BUILD
Landing: `/` renders a personal dashboard (current-year return status, next action, unread messages, docs still needed).
Routes exposed in nav:
- `/` — Personal dashboard
- `/profile` — Name, address, filing status, bank info for refund (new route)
- `/questionnaire` — Guided intake: dependents, life events, etc. (new route, stepper UI)
- `/documents` — Upload + "still needed" checklist (already exists; enhance with needed-docs panel)
- `/return` — Current-year status + past-years history table (new route, replaces generic returns list for this role)
- `/inbox` — Messages with assigned preparer (already exists; filter to client-visible only)
- `/return/sign` — E-sign / approve final return (new route)

Hidden: other clients, internal notes, billing, firm settings.

### 3. Tax Preparer (`preparer`) — BUILD
Landing: `/` renders a work queue (not a single return).
Routes:
- `/` — Queue: assigned clients sorted by urgency/status with filter chips
- `/returns/$id/*` — Existing return workspace (Overview, Review, Documents, Messages, Tasks) — keep as-is
- Messages tab gains an "Internal note" composer (already present) and a "Request document" quick action that creates a task + client-visible message
- New action on Overview: "Mark complete → Submit for review" button that transitions status

Hidden: other preparers' clients, billing, firm settings.

### 5. Firm Administrator (`firm_admin`) — BUILD
Landing: `/` renders a firm-wide dashboard.
Routes:
- `/` — Firm dashboard: totals across all clients, staff utilization, revenue snapshot
- `/firm/staff` — Staff table: add/remove, assign role, assign clients
- `/firm/billing` — Invoices & payment status per client
- `/firm/settings` — Engagement letter templates, branding, policies
- `/clients` — Full client roster (all preparers)
- `/returns` — All returns across the firm

Full visibility across preparers and clients.

## Design-Only Roles

Each renders a single labeled page explaining the concept with a static mock UI. No new business logic, no new data flows.

- **Business Owner** (`/design/business-owner`): Client dashboard mock with an "Entities" switcher (Personal · Acme LLC · Contoso Inc.) and a business-docs section (P&L, payroll, sales tax).
- **Reviewer** (`/design/reviewer`): Preparer workspace mock with a "Review queue" sidebar and Approve / Send-back-with-comments action bar; edits shown with a "Reviewer edit" audit chip.
- **Seasonal Staff** (`/design/seasonal-staff`): Preparer shell mock with e-file, approve, and billing controls visibly disabled + a "Access expires Apr 30" banner.

Each design-only page has a prominent "Design preview — not interactive" banner.

## Navigation & Shell

`AppShell` reads the active role and renders a role-specific sidebar nav:

```text
Individual Client:  Dashboard · Profile · Questionnaire · Documents · Return · Messages
Preparer:           Queue · Clients · Returns · Inbox · Tasks
Firm Admin:         Firm Dashboard · Staff · Clients · Returns · Billing · Settings
Design-only roles:  single "Overview" link → their /design/* page
```

Top-bar role switcher becomes a dropdown grouped by Clients / Staff / Design previews. Switching role also navigates to that role's landing route so the user never lands on a page their role can't see.

## Data Additions (`src/data/mock.ts`)

Add lightweight arrays: `staff[]`, `invoices[]`, `pastReturns[]` (multi-year history for the individual client), `neededDocs[]` per return, `questionnaireSteps[]`. Keep everything in-memory mock — no backend.

## Files

New:
- `src/routes/profile.tsx`
- `src/routes/questionnaire.tsx`
- `src/routes/return.tsx` (client's own return + history)
- `src/routes/return.sign.tsx`
- `src/routes/firm.tsx` (layout with Outlet + firm nav)
- `src/routes/firm.staff.tsx`
- `src/routes/firm.billing.tsx`
- `src/routes/firm.settings.tsx`
- `src/routes/design.business-owner.tsx`
- `src/routes/design.reviewer.tsx`
- `src/routes/design.seasonal-staff.tsx`

Modified:
- `src/data/mock.ts` — expand `Role` union + new mock arrays
- `src/lib/role-context.tsx` — support 6 roles
- `src/components/AppShell.tsx` — role-grouped switcher, role-aware sidebar, redirect on switch
- `src/routes/index.tsx` — branch by role: client dashboard / preparer queue / firm dashboard
- `src/routes/inbox.tsx` — small role tweaks

## Out of Scope

- No real auth, no permissions enforcement server-side (mock only).
- No new backend. All state stays client-side.
- Design-only roles stay static — no interactive queues or forms.
