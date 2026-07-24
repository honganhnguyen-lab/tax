// Hardcoded mock data for the tax platform demo.
// Fabricated traceability, threads, tasks, roles.

export type Role =
  | "client_individual"
  | "client_business"
  | "preparer"
  | "reviewer"
  | "firm_admin"
  | "seasonal_staff";

// Legacy aliases kept for existing components that still branch on "cpa"/"client".
export type LegacyRole = "cpa" | "client";
export function toLegacyRole(role: Role): LegacyRole {
  if (role === "client_individual" || role === "client_business") return "client";
  return "cpa";
}

export const roleMeta: Record<Role, { label: string; group: "Client" | "Staff"; built: boolean; landing: string; tagline: string }> = {
  client_individual: { label: "Individual client", group: "Client", built: true, landing: "/", tagline: "Files their own personal return" },
  client_business:   { label: "Business owner",    group: "Client", built: false, landing: "/design/business-owner", tagline: "Individual + business entities" },
  preparer:          { label: "Tax preparer",      group: "Staff",  built: true, landing: "/", tagline: "Works a queue of assigned returns" },
  reviewer:          { label: "Reviewer",          group: "Staff",  built: false, landing: "/design/reviewer", tagline: "Approves work before filing" },
  firm_admin:        { label: "Firm administrator",group: "Staff",  built: true, landing: "/", tagline: "Runs the firm, sees everything" },
  seasonal_staff:    { label: "Seasonal staff",    group: "Staff",  built: false, landing: "/design/seasonal-staff", tagline: "Preparer with reduced permissions" },
};

export type UserId = "u_cpa" | "u_client" | "u_reviewer" | "u_admin" | "u_seasonal";
export interface User {
  id: UserId;
  name: string;
  initials: string;
  role: Role;
  title: string;
}

export const users: Record<UserId, User> = {
  u_cpa:      { id: "u_cpa",      name: "Morgan Ellis, CPA",  initials: "ME", role: "preparer",          title: "Senior Preparer" },
  u_reviewer: { id: "u_reviewer", name: "Priya Shah",         initials: "PS", role: "reviewer",          title: "Reviewer" },
  u_client:   { id: "u_client",   name: "Jamie Chen",         initials: "JC", role: "client_individual", title: "Client" },
  u_admin:    { id: "u_admin",    name: "Dana Whitfield",     initials: "DW", role: "firm_admin",        title: "Firm Administrator" },
  u_seasonal: { id: "u_seasonal", name: "Alex Kim",           initials: "AK", role: "seasonal_staff",    title: "Seasonal Preparer" },
};

export type ReturnStatus =
  | "not_started"
  | "collecting_docs"
  | "in_preparation"
  | "awaiting_client"
  | "in_review"
  | "ready_to_file"
  | "filed";

export interface TaxReturn {
  id: string;
  clientName: string;
  entity: string;
  taxYear: number;
  form: string;
  status: ReturnStatus;
  progress: number; // 0..100
  owner: UserId;
  nextAction: string;
  nextActionOwner: UserId;
  dueDate: string;
  refund?: number;
  balanceDue?: number;
  priority: "low" | "normal" | "high" | "urgent";
  openItems: number;
  blocked?: string;
}

export const returns: TaxReturn[] = [
  {
    id: "R-2024-0142", clientName: "Jamie Chen", entity: "Individual", taxYear: 2024,
    form: "Form 1040", status: "awaiting_client", progress: 62, owner: "u_cpa",
    nextAction: "Client to answer 3 open questions", nextActionOwner: "u_client",
    dueDate: "2025-04-15", refund: 2840, priority: "high", openItems: 3,
  },
  {
    id: "R-2024-0138", clientName: "Northwind Bakery LLC", entity: "S-Corp", taxYear: 2024,
    form: "Form 1120-S", status: "in_review", progress: 84, owner: "u_cpa",
    nextAction: "Reviewer sign-off on Schedule K-1", nextActionOwner: "u_reviewer",
    dueDate: "2025-03-15", balanceDue: 12400, priority: "urgent", openItems: 1,
  },
  {
    id: "R-2024-0155", clientName: "Alicia Romero", entity: "Individual", taxYear: 2024,
    form: "Form 1040", status: "in_preparation", progress: 41, owner: "u_cpa",
    nextAction: "Preparer to enter Schedule C", nextActionOwner: "u_cpa",
    dueDate: "2025-04-15", priority: "normal", openItems: 5,
  },
  {
    id: "R-2024-0161", clientName: "Kestrel Studio Inc.", entity: "C-Corp", taxYear: 2024,
    form: "Form 1120", status: "collecting_docs", progress: 18, owner: "u_cpa",
    nextAction: "Client to upload Q4 bank statements", nextActionOwner: "u_client",
    dueDate: "2025-04-15", priority: "high", openItems: 7, blocked: "Missing 2 required docs",
  },
  {
    id: "R-2024-0102", clientName: "Robert & Lynn Park", entity: "MFJ", taxYear: 2024,
    form: "Form 1040", status: "ready_to_file", progress: 98, owner: "u_cpa",
    nextAction: "Client to e-sign 8879", nextActionOwner: "u_client",
    dueDate: "2025-04-15", refund: 1120, priority: "high", openItems: 0,
  },
  {
    id: "R-2024-0089", clientName: "Delta Freight Co.", entity: "Partnership", taxYear: 2024,
    form: "Form 1065", status: "filed", progress: 100, owner: "u_cpa",
    nextAction: "None", nextActionOwner: "u_cpa",
    dueDate: "2025-03-15", priority: "low", openItems: 0,
  },
  {
    id: "R-2024-0177", clientName: "Meridian Consulting", entity: "S-Corp", taxYear: 2024,
    form: "Form 1120-S", status: "not_started", progress: 0, owner: "u_cpa",
    nextAction: "Send engagement letter", nextActionOwner: "u_cpa",
    dueDate: "2025-03-15", priority: "normal", openItems: 0,
  },
];

// ---------------------- Documents ----------------------
export type DocKind = "W-2" | "1099-NEC" | "1099-INT" | "1099-DIV" | "1098" | "K-1" | "Bank Stmt" | "Receipt" | "Other";
export interface SourceDoc {
  id: string;
  returnId: string;
  name: string;
  kind: DocKind;
  pages: number;
  uploadedAt: string;
  uploadedBy: UserId;
  status: "verified" | "ai_extracted" | "needs_review" | "pending_upload";
  issuer?: string;
}

// Generate a large-ish fake corpus for the "hundreds of docs" challenge.
const docKinds: DocKind[] = ["W-2","1099-NEC","1099-INT","1099-DIV","1098","K-1","Bank Stmt","Receipt","Other"];
const issuers = ["Acme Corp","Northwind Bank","Fidelity","Vanguard","Chase","Wells Fargo","Amex","Stripe","Square","LinkedIn","Uber","DoorDash","Airbnb"];

function seedDocs(): SourceDoc[] {
  const list: SourceDoc[] = [];
  // Explicit docs for R-2024-0142 (used by traceability)
  list.push(
    { id: "D-142-01", returnId: "R-2024-0142", name: "W-2 — Acme Corp 2024.pdf", kind: "W-2", pages: 2, uploadedAt: "2025-02-03", uploadedBy: "u_client", status: "verified", issuer: "Acme Corp" },
    { id: "D-142-02", returnId: "R-2024-0142", name: "1099-INT — Northwind Bank.pdf", kind: "1099-INT", pages: 1, uploadedAt: "2025-02-04", uploadedBy: "u_client", status: "ai_extracted", issuer: "Northwind Bank" },
    { id: "D-142-03", returnId: "R-2024-0142", name: "1099-DIV — Fidelity Brokerage.pdf", kind: "1099-DIV", pages: 3, uploadedAt: "2025-02-05", uploadedBy: "u_client", status: "ai_extracted", issuer: "Fidelity" },
    { id: "D-142-04", returnId: "R-2024-0142", name: "1098 — Mortgage Interest.pdf", kind: "1098", pages: 1, uploadedAt: "2025-02-05", uploadedBy: "u_client", status: "verified", issuer: "Chase" },
    { id: "D-142-05", returnId: "R-2024-0142", name: "Charitable receipts bundle.pdf", kind: "Receipt", pages: 8, uploadedAt: "2025-02-10", uploadedBy: "u_client", status: "needs_review" },
  );
  // Bulk filler
  let n = 1;
  for (const r of returns) {
    const target = r.id === "R-2024-0138" ? 84 : r.id === "R-2024-0161" ? 46 : 22;
    for (let i = 0; i < target; i++) {
      const k = docKinds[(i + n) % docKinds.length];
      list.push({
        id: `D-${r.id.slice(-4)}-b${i}`,
        returnId: r.id,
        name: `${k} — ${issuers[(i * 3 + n) % issuers.length]} #${1000 + i}.pdf`,
        kind: k, pages: 1 + ((i * 7) % 12),
        uploadedAt: `2025-02-${String(1 + (i % 27)).padStart(2, "0")}`,
        uploadedBy: i % 3 === 0 ? "u_cpa" : "u_client",
        status: (["verified","ai_extracted","needs_review","pending_upload"] as const)[(i + n) % 4],
        issuer: issuers[(i * 3 + n) % issuers.length],
      });
      n++;
    }
  }
  return list;
}

export const documents: SourceDoc[] = seedDocs();

// ---------------------- Traceability ----------------------
export interface ReturnField {
  id: string;
  returnId: string;
  line: string; // e.g. "1a"
  label: string;
  section: string; // e.g. "Income"
  value: number;
  state: "ai" | "verified" | "locked" | "editable" | "needs_review";
  confidence?: number; // 0..1
  sources: FieldSource[];
  calc?: string;
}
export interface FieldSource {
  docId: string;
  page: number;
  box: string; // "Box 1"
  extracted: number;
  transform?: string;
}

export const fields: ReturnField[] = [
  {
    id: "F-142-1a", returnId: "R-2024-0142", line: "1a", label: "Wages, salaries, tips",
    section: "Income", value: 128400, state: "verified", confidence: 0.99,
    sources: [{ docId: "D-142-01", page: 1, box: "Box 1 — Wages", extracted: 128400 }],
    calc: "Direct copy from W-2 Box 1",
  },
  {
    id: "F-142-2b", returnId: "R-2024-0142", line: "2b", label: "Taxable interest",
    section: "Income", value: 1284, state: "ai", confidence: 0.87,
    sources: [{ docId: "D-142-02", page: 1, box: "Box 1 — Interest income", extracted: 1284 }],
    calc: "Sum of Box 1 across 1 interest form(s)",
  },
  {
    id: "F-142-3a", returnId: "R-2024-0142", line: "3a", label: "Qualified dividends",
    section: "Income", value: 2415, state: "ai", confidence: 0.91,
    sources: [{ docId: "D-142-03", page: 1, box: "Box 1b — Qualified dividends", extracted: 2415 }],
    calc: "Sum of Box 1b across 1 dividend form(s)",
  },
  {
    id: "F-142-3b", returnId: "R-2024-0142", line: "3b", label: "Ordinary dividends",
    section: "Income", value: 3120, state: "ai", confidence: 0.93,
    sources: [{ docId: "D-142-03", page: 1, box: "Box 1a — Total ordinary dividends", extracted: 3120 }],
    calc: "Sum of Box 1a across 1 dividend form(s)",
  },
  {
    id: "F-142-8a", returnId: "R-2024-0142", line: "Sch. A 8a", label: "Home mortgage interest",
    section: "Itemized Deductions", value: 14620, state: "verified", confidence: 1,
    sources: [{ docId: "D-142-04", page: 1, box: "Box 1 — Mortgage interest received", extracted: 14620 }],
    calc: "Direct copy from Form 1098 Box 1",
  },
  {
    id: "F-142-11", returnId: "R-2024-0142", line: "Sch. A 11", label: "Gifts to charity",
    section: "Itemized Deductions", value: 3250, state: "needs_review", confidence: 0.62,
    sources: [{ docId: "D-142-05", page: 3, box: "Receipt totals (pp. 3–7)", extracted: 3250, transform: "Sum of 12 receipts across pp. 3–7 minus 1 duplicate on p. 5" }],
    calc: "Aggregation with 1 duplicate removed",
  },
  {
    id: "F-142-agi", returnId: "R-2024-0142", line: "11", label: "Adjusted Gross Income",
    section: "Income", value: 135219, state: "locked",
    sources: [
      { docId: "D-142-01", page: 1, box: "W-2 Box 1", extracted: 128400 },
      { docId: "D-142-02", page: 1, box: "1099-INT Box 1", extracted: 1284 },
      { docId: "D-142-03", page: 1, box: "1099-DIV Box 1a", extracted: 3120 },
    ],
    calc: "1a + 2b + 3b + other income adjustments = 128,400 + 1,284 + 3,120 + 2,415 = 135,219",
  },
];

// Fabricated OCR "regions" for each source doc page (percent coords).
export interface DocRegion {
  docId: string; page: number; box: string;
  x: number; y: number; w: number; h: number;
  value: string;
}
export const docRegions: DocRegion[] = [
  { docId: "D-142-01", page: 1, box: "Box 1 — Wages", x: 55, y: 32, w: 30, h: 5, value: "$128,400.00" },
  { docId: "D-142-02", page: 1, box: "Box 1 — Interest income", x: 58, y: 40, w: 28, h: 5, value: "$1,284.00" },
  { docId: "D-142-03", page: 1, box: "Box 1a — Total ordinary dividends", x: 58, y: 30, w: 28, h: 5, value: "$3,120.00" },
  { docId: "D-142-03", page: 1, box: "Box 1b — Qualified dividends", x: 58, y: 38, w: 28, h: 5, value: "$2,415.00" },
  { docId: "D-142-04", page: 1, box: "Box 1 — Mortgage interest received", x: 55, y: 36, w: 30, h: 5, value: "$14,620.00" },
  { docId: "D-142-05", page: 3, box: "Receipt totals", x: 12, y: 20, w: 76, h: 60, value: "12 receipts, ~$3,250" },
];

// ---------------------- Threads / messages ----------------------
export type Visibility = "internal" | "client";
export interface Thread {
  id: string;
  returnId: string;
  subject: string;
  contextType: "document" | "field" | "task" | "general";
  contextId?: string;
  contextLabel?: string;
  participants: UserId[];
  status: "open" | "waiting_client" | "waiting_cpa" | "resolved";
  owner: UserId;
  updatedAt: string;
  messages: Message[];
}
export interface Message {
  id: string;
  author: UserId;
  visibility: Visibility;
  body: string;
  at: string;
}

export const threads: Thread[] = [
  {
    id: "T-1", returnId: "R-2024-0142", subject: "Charitable receipts — one duplicate?",
    contextType: "field", contextId: "F-142-11", contextLabel: "Sch. A line 11 — Gifts to charity",
    participants: ["u_cpa","u_client"], status: "waiting_client", owner: "u_client",
    updatedAt: "2025-03-04T15:12:00Z",
    messages: [
      { id: "M-1", author: "u_cpa", visibility: "internal", body: "OCR flagged a possible duplicate on p.5 of the receipts bundle ($250 to Redwood Shelter appears on p.3 too). Asking client.", at: "2025-03-04T14:02:00Z" },
      { id: "M-2", author: "u_cpa", visibility: "client", body: "Hi Jamie — on the charitable receipts bundle, page 5 has a $250 receipt to Redwood Shelter that also appears on page 3. Was this a single donation photographed twice, or two separate $250 gifts?", at: "2025-03-04T14:05:00Z" },
      { id: "M-3", author: "u_client", visibility: "client", body: "Let me check my records and get back to you today.", at: "2025-03-04T15:12:00Z" },
    ],
  },
  {
    id: "T-2", returnId: "R-2024-0142", subject: "1099-INT vs. bank statement mismatch",
    contextType: "document", contextId: "D-142-02", contextLabel: "1099-INT — Northwind Bank.pdf",
    participants: ["u_cpa","u_reviewer"], status: "open", owner: "u_cpa",
    updatedAt: "2025-03-03T18:00:00Z",
    messages: [
      { id: "M-4", author: "u_reviewer", visibility: "internal", body: "Interest on the 1099-INT ($1,284) is $32 higher than the sum of monthly bank interest we pulled. Confirm we're using the 1099 as authoritative.", at: "2025-03-03T18:00:00Z" },
    ],
  },
  {
    id: "T-3", returnId: "R-2024-0142", subject: "HSA contributions in 2024?",
    contextType: "task", contextId: "TK-2", contextLabel: "HSA questionnaire",
    participants: ["u_cpa","u_client"], status: "waiting_client", owner: "u_client",
    updatedAt: "2025-03-02T10:00:00Z",
    messages: [
      { id: "M-5", author: "u_cpa", visibility: "client", body: "Did you contribute to an HSA in 2024 outside of payroll? If yes, please upload Form 5498-SA.", at: "2025-03-02T10:00:00Z" },
    ],
  },
];

// ---------------------- Tasks ----------------------
export interface Task {
  id: string;
  returnId: string;
  title: string;
  detail?: string;
  owner: UserId;
  status: "todo" | "in_progress" | "waiting" | "done";
  due?: string;
  linkedDocId?: string;
  linkedFieldId?: string;
  linkedThreadId?: string;
  kind: "upload" | "answer" | "review" | "sign" | "prepare";
}
export const tasks: Task[] = [
  { id: "TK-1", returnId: "R-2024-0142", title: "Upload 2024 property tax bill", owner: "u_client", status: "todo", due: "2025-03-08", kind: "upload" },
  { id: "TK-2", returnId: "R-2024-0142", title: "Answer: HSA contributions in 2024?", owner: "u_client", status: "waiting", due: "2025-03-08", kind: "answer", linkedThreadId: "T-3" },
  { id: "TK-3", returnId: "R-2024-0142", title: "Confirm duplicate charity receipt", owner: "u_client", status: "waiting", due: "2025-03-06", kind: "answer", linkedFieldId: "F-142-11", linkedThreadId: "T-1" },
  { id: "TK-4", returnId: "R-2024-0142", title: "Reviewer: verify Schedule A totals", owner: "u_reviewer", status: "todo", due: "2025-03-10", kind: "review" },
  { id: "TK-5", returnId: "R-2024-0142", title: "E-sign Form 8879 when ready", owner: "u_client", status: "todo", kind: "sign" },
];

export interface OnboardingStep {
  id: string;
  title: string;
  detail: string;
  status: "done" | "current" | "todo";
  eta: string;
}
export const onboarding: OnboardingStep[] = [
  { id: "o1", title: "Confirm your details", detail: "Name, address, filing status", status: "done", eta: "1 min" },
  { id: "o2", title: "Upload your W-2 and 1099s", detail: "Snap photos or drag PDFs — we'll extract the numbers", status: "current", eta: "3 min" },
  { id: "o3", title: "Answer 6 quick questions", detail: "Life changes, HSA, dependents", status: "todo", eta: "4 min" },
  { id: "o4", title: "Review and approve", detail: "See every number tied to its source", status: "todo", eta: "5 min" },
  { id: "o5", title: "E-sign and file", detail: "One tap to submit", status: "todo", eta: "1 min" },
];

// ---------------------- Helpers ----------------------
export const statusMeta: Record<ReturnStatus, { label: string; tone: "info" | "warning" | "verified" | "locked" | "ai"; clientLabel: string }> = {
  not_started: { label: "Not started", tone: "locked", clientLabel: "Getting ready" },
  collecting_docs: { label: "Collecting documents", tone: "info", clientLabel: "We need a few things from you" },
  in_preparation: { label: "In preparation", tone: "ai", clientLabel: "Your preparer is working on it" },
  awaiting_client: { label: "Awaiting client", tone: "warning", clientLabel: "Your turn — a few questions" },
  in_review: { label: "In review", tone: "ai", clientLabel: "Final review by our team" },
  ready_to_file: { label: "Ready to file", tone: "verified", clientLabel: "Ready for your signature" },
  filed: { label: "Filed", tone: "verified", clientLabel: "Filed — you're done" },
};

export function fmt$(n?: number) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// ---------------------- Client profile / questionnaire ----------------------
export interface ClientProfile {
  legalName: string;
  filingStatus: "Single" | "Married filing jointly" | "Married filing separately" | "Head of household";
  address: { line1: string; city: string; state: string; zip: string };
  ssnMasked: string;
  phone: string;
  email: string;
  refundBank: { bankName: string; routingMasked: string; accountMasked: string; type: "Checking" | "Savings" };
}
export const clientProfile: ClientProfile = {
  legalName: "Jamie A. Chen",
  filingStatus: "Single",
  address: { line1: "482 Alder Street, Apt 3B", city: "Portland", state: "OR", zip: "97214" },
  ssnMasked: "•••-••-4421",
  phone: "(503) 555-0142",
  email: "jamie.chen@example.com",
  refundBank: { bankName: "Northwind Bank", routingMasked: "•••••4021", accountMasked: "••••2288", type: "Checking" },
};

export interface QuestionnaireStep {
  id: string;
  section: "Life changes" | "Dependents" | "Income" | "Deductions" | "Health";
  question: string;
  helper?: string;
  answered: boolean;
  answer?: string;
}
export const questionnaire: QuestionnaireStep[] = [
  { id: "q1", section: "Life changes", question: "Did you get married, divorced, or have a child in 2024?", answered: true, answer: "No" },
  { id: "q2", section: "Life changes", question: "Did you move to a different state in 2024?", answered: true, answer: "No" },
  { id: "q3", section: "Dependents", question: "How many dependents will you claim?", helper: "Include qualifying children and relatives", answered: true, answer: "0" },
  { id: "q4", section: "Income", question: "Did you have any freelance or self-employment income?", answered: false },
  { id: "q5", section: "Deductions", question: "Did you make charitable donations over $500?", helper: "We'll help you itemize if it lowers your tax", answered: false },
  { id: "q6", section: "Health", question: "Did you contribute to an HSA outside of payroll?", helper: "If yes, we'll need your Form 5498-SA", answered: false },
];

// ---------------------- Needed docs (client-visible checklist) ----------------------
export interface NeededDoc {
  id: string;
  returnId: string;
  kind: DocKind | "Other";
  label: string;
  reason: string;
  status: "received" | "waiting" | "optional";
}
export const neededDocs: NeededDoc[] = [
  { id: "N1", returnId: "R-2024-0142", kind: "W-2", label: "W-2 from Acme Corp", reason: "Primary employer 2024", status: "received" },
  { id: "N2", returnId: "R-2024-0142", kind: "1099-INT", label: "1099-INT from Northwind Bank", reason: "Bank interest income", status: "received" },
  { id: "N3", returnId: "R-2024-0142", kind: "1099-DIV", label: "1099-DIV from Fidelity", reason: "Brokerage dividends", status: "received" },
  { id: "N4", returnId: "R-2024-0142", kind: "1098", label: "1098 mortgage interest", reason: "Home mortgage deduction", status: "received" },
  { id: "N5", returnId: "R-2024-0142", kind: "Other", label: "2024 property tax bill", reason: "Itemized deduction (SALT)", status: "waiting" },
  { id: "N6", returnId: "R-2024-0142", kind: "Other", label: "Form 5498-SA (HSA)", reason: "Only if you contributed outside payroll", status: "optional" },
];

// ---------------------- Past returns (client history) ----------------------
export interface PastReturn {
  id: string;
  taxYear: number;
  form: string;
  filedOn: string;
  refund?: number;
  balanceDue?: number;
  status: "filed" | "amended";
}
export const pastReturns: PastReturn[] = [
  { id: "R-2023-0114", taxYear: 2023, form: "Form 1040", filedOn: "2024-03-28", refund: 1980, status: "filed" },
  { id: "R-2022-0088", taxYear: 2022, form: "Form 1040", filedOn: "2023-04-06", refund: 720, status: "filed" },
  { id: "R-2021-0071", taxYear: 2021, form: "Form 1040", filedOn: "2022-04-11", balanceDue: 340, status: "filed" },
];

// ---------------------- Firm staff (admin view) ----------------------
export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  role: Role;
  activeReturns: number;
  utilization: number; // 0..100
  status: "active" | "invited" | "off_season";
  email: string;
}
export const staff: StaffMember[] = [
  { id: "s_me",  name: "Morgan Ellis",     initials: "ME", role: "preparer",       activeReturns: 24, utilization: 82, status: "active", email: "morgan@ledgerline.co" },
  { id: "s_ps",  name: "Priya Shah",       initials: "PS", role: "reviewer",       activeReturns: 11, utilization: 64, status: "active", email: "priya@ledgerline.co" },
  { id: "s_ak",  name: "Alex Kim",         initials: "AK", role: "seasonal_staff", activeReturns:  8, utilization: 45, status: "active", email: "alex@ledgerline.co" },
  { id: "s_rj",  name: "Ravi Joshi",       initials: "RJ", role: "preparer",       activeReturns: 19, utilization: 71, status: "active", email: "ravi@ledgerline.co" },
  { id: "s_tn",  name: "Taylor Nguyen",    initials: "TN", role: "preparer",       activeReturns: 15, utilization: 58, status: "active", email: "taylor@ledgerline.co" },
  { id: "s_lw",  name: "Lena Weiss",       initials: "LW", role: "seasonal_staff", activeReturns:  0, utilization:  0, status: "invited", email: "lena@ledgerline.co" },
  { id: "s_dw",  name: "Dana Whitfield",   initials: "DW", role: "firm_admin",     activeReturns:  0, utilization:  0, status: "active", email: "dana@ledgerline.co" },
];

// ---------------------- Invoices (billing) ----------------------
export interface Invoice {
  id: string;
  clientName: string;
  returnId?: string;
  amount: number;
  issued: string;
  due: string;
  status: "paid" | "sent" | "overdue" | "draft";
}
export const invoices: Invoice[] = [
  { id: "INV-1041", clientName: "Jamie Chen",           returnId: "R-2024-0142", amount: 480,  issued: "2025-02-15", due: "2025-03-01", status: "paid" },
  { id: "INV-1042", clientName: "Northwind Bakery LLC", returnId: "R-2024-0138", amount: 2400, issued: "2025-02-18", due: "2025-03-04", status: "sent" },
  { id: "INV-1043", clientName: "Alicia Romero",        returnId: "R-2024-0155", amount: 560,  issued: "2025-02-20", due: "2025-03-06", status: "overdue" },
  { id: "INV-1044", clientName: "Kestrel Studio Inc.",  returnId: "R-2024-0161", amount: 3200, issued: "2025-02-22", due: "2025-03-08", status: "sent" },
  { id: "INV-1045", clientName: "Robert & Lynn Park",   returnId: "R-2024-0102", amount: 640,  issued: "2025-02-25", due: "2025-03-11", status: "paid" },
  { id: "INV-1046", clientName: "Delta Freight Co.",    returnId: "R-2024-0089", amount: 1800, issued: "2025-02-08", due: "2025-02-22", status: "paid" },
  { id: "INV-1047", clientName: "Meridian Consulting",  returnId: "R-2024-0177", amount: 1200, issued: "2025-03-01", due: "2025-03-15", status: "draft" },
];
