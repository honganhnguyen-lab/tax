import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { fields, documents, docRegions, fmt$, type ReturnField, type FieldSource } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldStateChip, fieldContainerClass } from "@/components/FieldChip";
import { Sparkles, ShieldCheck, ArrowRight, Lock, ChevronDown, ChevronRight, FileText, Calculator, MessageSquare, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/returns/$id/review")({
  head: () => ({
    meta: [
      { title: "Source Review · Ledgerline" },
      { name: "description", content: "Trace every number on the return back to its source document, page, and box." },
      { property: "og:title", content: "Source Review · Ledgerline" },
      { property: "og:description", content: "Side-by-side return review with document highlights and AI extraction transparency." },
    ],
  }),
  component: Review,
});

function Review() {
  const { id } = Route.useParams();
  const rFields = fields.filter(f => f.returnId === id);
  const [selectedId, setSelectedId] = useState<string>(rFields[0]?.id ?? "");
  const [selectedSourceIdx, setSelectedSourceIdx] = useState(0);
  const selected = rFields.find(f => f.id === selectedId) ?? rFields[0];
  const source = selected?.sources[selectedSourceIdx] ?? selected?.sources[0];
  const doc = documents.find(d => d.id === source?.docId);

  const sections = useMemo(() => {
    const map = new Map<string, ReturnField[]>();
    rFields.forEach(f => {
      if (!map.has(f.section)) map.set(f.section, []);
      map.get(f.section)!.push(f);
    });
    return Array.from(map.entries());
  }, [rFields]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] h-[calc(100vh-56px-32px-140px)] min-h-[600px]">
      {/* LEFT: return */}
      <div className="border-r border-border overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-6">
          <header>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Return · Form 1040</h2>
              <div className="flex gap-1.5">
                <LegendChip icon={<Sparkles className="h-3 w-3" />} label="AI" cls="chip-ai" />
                <LegendChip icon={<ShieldCheck className="h-3 w-3" />} label="Verified" cls="chip-verified" />
                <LegendChip icon={<Lock className="h-3 w-3" />} label="Calc" cls="chip-locked" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click any line to see exactly where the number came from.</p>
          </header>

          {sections.map(([section, list]) => (
            <section key={section}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{section}</h3>
              <div className="space-y-1.5">
                {list.map(f => {
                  const active = f.id === selectedId;
                  return (
                    <button
                      key={f.id}
                      onClick={() => { setSelectedId(f.id); setSelectedSourceIdx(0); }}
                      className={cn(
                        "w-full text-left rounded-md p-3 transition-all",
                        fieldContainerClass(f.state),
                        active && "ring-2 ring-accent ring-offset-1 ring-offset-background",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">Line {f.line}</span>
                            <FieldStateChip state={f.state} />
                            {f.confidence != null && f.state === "ai" && (
                              <span className="text-[10px]">confidence {Math.round(f.confidence*100)}%</span>
                            )}
                          </div>
                          <div className="text-sm font-medium mt-0.5">{f.label}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold font-mono">{fmt$(f.value)}</div>
                          <div className="text-[10px] text-muted-foreground">{f.sources.length} source{f.sources.length>1?"s":""}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* RIGHT: source viewer */}
      <div className="bg-muted/30 overflow-y-auto">
        {selected && source && doc ? (
          <div className="p-4 sm:p-6 space-y-4">
            <header className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Source for</div>
                <div className="text-lg font-semibold">{selected.label} <span className="font-mono text-sm text-muted-foreground">· Line {selected.line}</span></div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Value on return</div>
                <div className="text-xl font-semibold font-mono">{fmt$(selected.value)}</div>
              </div>
            </header>

            {/* Source picker if multi */}
            {selected.sources.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {selected.sources.map((s, i) => {
                  const d = documents.find(x => x.id === s.docId);
                  return (
                    <button key={i} onClick={()=>setSelectedSourceIdx(i)} className={cn(
                      "text-xs px-2.5 py-1 rounded-md border",
                      i === selectedSourceIdx ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
                    )}>
                      {d?.kind} · p.{s.page}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Trace chain */}
            <Card className="p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Trace</div>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <Chip icon={<FileText className="h-3 w-3" />}>{doc.name}</Chip>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Chip>Page {source.page}</Chip>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Chip>{source.box}</Chip>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Chip mono>{fmt$(source.extracted)}</Chip>
                {source.transform && <>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Chip icon={<Calculator className="h-3 w-3" />}>{source.transform}</Chip>
                </>}
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Chip mono tone="verified">{fmt$(selected.value)}</Chip>
              </div>
              {selected.calc && (
                <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  <span className="uppercase tracking-wider font-semibold mr-2">Calculation</span>{selected.calc}
                </div>
              )}
            </Card>

            {/* Faux document viewer with highlighted region */}
            <DocumentViewer docName={doc.name} kind={doc.kind} page={source.page} pages={doc.pages}
              region={docRegions.find(r => r.docId === source.docId && r.page === source.page && r.box === source.box)}
              extractedValue={fmt$(source.extracted)}
            />

            <div className="flex flex-wrap gap-2">
              <Button size="sm"><ShieldCheck className="h-3.5 w-3.5 mr-1.5" />Approve value</Button>
              <Button variant="secondary" size="sm">Override…</Button>
              <Button variant="ghost" size="sm"><MessageSquare className="h-3.5 w-3.5 mr-1.5" />Ask client</Button>
              <Button variant="ghost" size="sm"><ExternalLink className="h-3.5 w-3.5 mr-1.5" />Open document</Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-sm text-muted-foreground">Select a line on the return to see its source.</div>
        )}
      </div>
    </div>
  );
}

function LegendChip({ icon, label, cls }: { icon: React.ReactNode; label: string; cls: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", cls)}>{icon}{label}</span>;
}

function Chip({ children, mono, tone, icon }: { children: React.ReactNode; mono?: boolean; tone?: "verified"; icon?: React.ReactNode }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs",
      tone === "verified" ? "chip-verified" : "bg-card border-border",
      mono && "font-mono",
    )}>
      {icon}{children}
    </span>
  );
}

function DocumentViewer({ docName, kind, page, pages, region, extractedValue }: {
  docName: string; kind: string; page: number; pages: number;
  region?: { x: number; y: number; w: number; h: number; box: string };
  extractedValue: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
        <div className="text-xs font-medium truncate">{docName}</div>
        <div className="text-xs text-muted-foreground">Page {page} of {pages}</div>
      </div>
      <div className="relative bg-[oklch(0.98_0.01_240)] aspect-[1/1.29] max-h-[520px]">
        {/* Faux document */}
        <div className="absolute inset-4 bg-white shadow-inner rounded-sm p-6 text-[10px] leading-relaxed text-neutral-800 font-mono overflow-hidden">
          <div className="flex items-start justify-between border-b pb-2 mb-3">
            <div>
              <div className="text-[8px] uppercase tracking-widest text-neutral-500">Form</div>
              <div className="text-base font-bold">{kind}</div>
            </div>
            <div className="text-[8px] text-right text-neutral-500">
              OMB No. 1545-0008<br />
              Tax year 2024
            </div>
          </div>
          <FauxRows kind={kind} />
        </div>

        {/* Highlight overlay */}
        {region && (
          <>
            <div
              className="absolute rounded-md ring-2 ring-accent shadow-[0_0_0_9999px_oklch(0.15_0.03_260/0.35)] animate-in fade-in duration-500"
              style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.w}%`, height: `${region.h}%` }}
            />
            <div
              className="absolute bg-accent text-accent-foreground text-[10px] px-2 py-1 rounded shadow-md font-medium"
              style={{ left: `${region.x}%`, top: `calc(${region.y}% - 24px)` }}
            >
              {region.box} → {extractedValue}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function FauxRows({ kind }: { kind: string }) {
  const rows = kind.includes("W-2") ? [
    ["a Employee's SSN", "***-**-4421"],
    ["b Employer EIN", "12-3456789"],
    ["c Employer name, address", "Acme Corp, 1 Market St, SF CA"],
    ["1 Wages, tips, other compensation", "128,400.00"],
    ["2 Federal income tax withheld", "24,110.00"],
    ["3 Social security wages", "128,400.00"],
    ["4 Social security tax withheld", "7,960.80"],
    ["5 Medicare wages and tips", "128,400.00"],
    ["6 Medicare tax withheld", "1,861.80"],
    ["12a Code D (401k)", "9,200.00"],
  ] : kind.includes("1099-INT") ? [
    ["Payer", "Northwind Bank"],
    ["Recipient", "Jamie Chen"],
    ["1 Interest income", "1,284.00"],
    ["2 Early withdrawal penalty", "0.00"],
    ["3 US Savings bond interest", "0.00"],
    ["4 Federal income tax withheld", "0.00"],
    ["8 Tax-exempt interest", "0.00"],
  ] : kind.includes("1099-DIV") ? [
    ["Payer", "Fidelity Brokerage"],
    ["1a Total ordinary dividends", "3,120.00"],
    ["1b Qualified dividends", "2,415.00"],
    ["2a Total capital gain distr.", "412.00"],
    ["3 Nondividend distributions", "0.00"],
    ["7 Foreign tax paid", "18.42"],
  ] : kind.includes("1098") ? [
    ["Lender", "Chase Home Lending"],
    ["Borrower", "Jamie Chen"],
    ["1 Mortgage interest received", "14,620.00"],
    ["2 Outstanding mortgage principal", "412,500.00"],
    ["3 Mortgage origination date", "2019-07-15"],
    ["5 Mortgage insurance premiums", "0.00"],
  ] : [
    ["Charitable receipts bundle (12 receipts)", ""],
    ["Redwood Shelter — Mar 3", "$250.00"],
    ["City Food Bank — May 12", "$500.00"],
    ["Public Radio — Jun 20", "$120.00"],
    ["Redwood Shelter — Sep 8 (dup?)", "$250.00"],
    ["Habitat Build — Oct 2", "$1,000.00"],
    ["… 7 more receipts", ""],
  ];
  return (
    <div className="space-y-1.5">
      {rows.map(([k, v], i) => (
        <div key={i} className="flex justify-between border-b border-neutral-100 py-0.5">
          <span className="text-neutral-600">{k}</span>
          <span className="font-semibold">{v}</span>
        </div>
      ))}
    </div>
  );
}
