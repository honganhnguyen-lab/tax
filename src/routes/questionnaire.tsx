import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { questionnaire, type QuestionnaireStep } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/questionnaire")({
  head: () => ({
    meta: [
      { title: "Questionnaire · Ledgerline" },
      { name: "description", content: "Guided intake questions about your year — dependents, life events, income, and deductions." },
      { property: "og:title", content: "Questionnaire · Ledgerline" },
      { property: "og:description", content: "Guided intake questions about your year — dependents, life events, income, and deductions." },
    ],
  }),
  component: Questionnaire,
});

function Questionnaire() {
  const [steps, setSteps] = useState<QuestionnaireStep[]>(questionnaire);
  const answered = steps.filter(s => s.answered).length;
  const pct = Math.round((answered / steps.length) * 100);
  const currentIndex = steps.findIndex(s => !s.answered);
  const current = currentIndex >= 0 ? steps[currentIndex] : null;

  const answer = (val: string) => {
    if (!current) return;
    setSteps(prev => prev.map(s => s.id === current.id ? { ...s, answered: true, answer: val } : s));
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">A few questions about your year</h1>
        <p className="text-sm text-muted-foreground">
          Your answers help us pick the right forms and deductions. About 4 minutes.
        </p>
      </header>

      <div>
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <span>{answered} of {steps.length} answered</span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} />
      </div>

      {current ? (
        <Card className="p-5">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{current.section}</Badge>
          <h2 className="text-lg font-semibold mt-3">{current.question}</h2>
          {current.helper && <p className="text-sm text-muted-foreground mt-1">{current.helper}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => answer("Yes")}>Yes</Button>
            <Button variant="secondary" onClick={() => answer("No")}>No</Button>
            <Button variant="ghost" onClick={() => answer("Not sure")}>Not sure</Button>
          </div>
          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
            <ArrowRight className="h-3 w-3" /> Question {currentIndex + 1} of {steps.length}
          </div>
        </Card>
      ) : (
        <Card className="p-5 border-verified/40 bg-verified/5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-verified" />
            <div>
              <div className="font-semibold">All questions answered</div>
              <div className="text-sm text-muted-foreground">Your preparer will review your answers with the rest of your return.</div>
            </div>
          </div>
        </Card>
      )}

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your answers so far</h3>
        <Card className="divide-y">
          {steps.map((s, i) => (
            <div key={s.id} className={cn("p-3 flex items-start gap-3 text-sm", i === currentIndex && "bg-accent/5")}>
              {s.answered ? <CheckCircle2 className="h-4 w-4 text-verified mt-0.5" /> : <Circle className="h-4 w-4 text-muted-foreground/60 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <div className={cn("truncate", s.answered ? "" : "font-medium")}>{s.question}</div>
                <div className="text-xs text-muted-foreground">{s.section}{s.answer ? ` · You said: ${s.answer}` : ""}</div>
              </div>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
