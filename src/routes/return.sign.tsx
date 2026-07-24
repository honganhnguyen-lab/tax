import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { returns, fields, fmt$ } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CheckCircle2, PenLine, ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/return/sign")({
  head: () => ({
    meta: [
      { title: "Review & sign · Ledgerline" },
      { name: "description", content: "Review your finished return and e-sign Form 8879 to file." },
      { property: "og:title", content: "Review & sign · Ledgerline" },
      { property: "og:description", content: "Review your finished return and e-sign Form 8879 to file." },
    ],
  }),
  component: Sign,
});

function Sign() {
  const myReturn = returns.find(r => r.clientName === "Jamie Chen")!;
  const myFields = fields.filter(f => f.returnId === myReturn.id);
  const income = myFields.filter(f => f.section === "Income");
  const deductions = myFields.filter(f => f.section === "Itemized Deductions");

  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [signed, setSigned] = useState(false);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/return" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to my return
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Review & sign your return</h1>
        <p className="text-sm text-muted-foreground">Take a look at the numbers, then e-sign Form 8879 to file.</p>
      </div>

      {signed ? (
        <Card className="p-6 border-verified/40 bg-verified/5 text-center">
          <CheckCircle2 className="h-10 w-10 text-verified mx-auto" />
          <h2 className="text-xl font-semibold mt-3">Signed and submitted for filing</h2>
          <p className="text-sm text-muted-foreground mt-1">
            We'll transmit your return to the IRS and email you the confirmation number within 24 hours.
          </p>
          <Button asChild className="mt-5"><Link to="/return">Back to my return</Link></Button>
        </Card>
      ) : (
        <>
          {/* Refund summary */}
          <Card className="p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-muted-foreground">2024 Federal · {myReturn.form}</div>
              <div className="text-sm mt-1">Your expected refund</div>
            </div>
            <div className="text-3xl font-semibold font-mono text-verified">{fmt$(myReturn.refund)}</div>
          </Card>

          {/* Income */}
          <Section title="Income">
            {income.map(f => (
              <FieldRow key={f.id} label={`${f.line} — ${f.label}`} value={fmt$(f.value)} />
            ))}
          </Section>

          {/* Deductions */}
          {deductions.length > 0 && (
            <Section title="Deductions">
              {deductions.map(f => (
                <FieldRow key={f.id} label={`${f.line} — ${f.label}`} value={fmt$(f.value)} />
              ))}
            </Section>
          )}

          {/* Sign */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-verified" />
              <h2 className="font-semibold">E-sign Form 8879</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              By signing you authorize Ledgerline to e-file your 2024 federal return. Your preparer has reviewed every number.
            </p>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox checked={agreed} onCheckedChange={v => setAgreed(!!v)} className="mt-0.5" />
              <span>I've reviewed my return and the information is true and complete to the best of my knowledge.</span>
            </label>
            <div>
              <label className="text-xs text-muted-foreground">Type your full legal name to sign</label>
              <Input
                value={signature}
                onChange={e => setSignature(e.target.value)}
                placeholder="Jamie A. Chen"
                className="mt-1 font-serif text-lg"
              />
            </div>
            <div className="pt-2">
              <Button
                onClick={() => setSigned(true)}
                disabled={!agreed || signature.trim().length < 4}
                size="lg"
              >
                <PenLine className="h-4 w-4 mr-1.5" />Sign & submit for filing
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</h3>
      <Card className="divide-y">{children}</Card>
    </section>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 flex items-center gap-3 text-sm">
      <div className="flex-1 min-w-0 truncate">{label}</div>
      <div className="font-mono">{value}</div>
      <Badge className="chip-verified gap-1"><CheckCircle2 className="h-3 w-3" />Verified</Badge>
    </div>
  );
}
