import { useState } from "react";
import { BookOpen } from "lucide-react";
import { coverOptions, explainCover } from "../lib/explainCover";

export function ExplainCoverTool() {
  const [key, setKey] = useState(coverOptions[0]?.key ?? "");
  const result = explainCover(key);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-foreground">
        <BookOpen className="h-5 w-5 text-primary-600" aria-hidden />
        Explain my cover
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">Plain-language summaries from standard policy types — not a substitute for your policy wording.</p>
      <select
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        {coverOptions.map((o) => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
      {result && (
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-surface-foreground">{result.summary}</p>
          <div>
            <p className="font-semibold text-surface-foreground">Typically includes</p>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {result.typicalIncludes.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-surface-foreground">Watch out for</p>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {result.watchOut.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
