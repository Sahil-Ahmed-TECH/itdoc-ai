import { useEffect, useState } from "react";
import { AutoTextarea } from "@/components/AutoTextarea";
import { Sparkles } from "lucide-react";

const PLACEHOLDER = `Example:
• User reports service or system issue
• Observed error, behavior, or failure condition
• Performed initial diagnostic checks
• Verified system state and configuration
• Executed diagnostic commands / utilities
• Applied corrective changes
• Retested service and confirmed resolution`;

const ANALYZING_MESSAGES = [
  "Analyzing technician notes…",
  "Extracting issue details…",
  "Structuring documentation…",
];

export interface QuickCaptureProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isAnalyzing: boolean;
}

export function QuickCapture({
  value,
  onChange,
  onAnalyze,
  onClear,
  isAnalyzing,
}: QuickCaptureProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setMsgIndex(0);
      return;
    }
    const id = setInterval(() => {
      setMsgIndex((i) => (i < ANALYZING_MESSAGES.length - 1 ? i + 1 : i));
    }, 900);
    return () => clearInterval(id);
  }, [isAnalyzing]);

  return (
    <section
  aria-label="Quick Capture"
  className="panel p-5 sm:p-6"
>
      <div className="flex items-start justify-between gap-4">
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
      <Sparkles className="h-4 w-4" />
    </div>

    <div>
      <h2 className="text-base font-semibold tracking-tight">
        Quick Capture
      </h2>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-primary/70">
        Technician Intake
      </p>
    </div>
  </div>

  <span className="hidden rounded-md border border-border/80 bg-surface-elevated px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:inline-flex">
    Raw/Rough Notes
  </span>
</div>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Paste your Raw/Rough troubleshooting notes and let ITDoc AI organize them into
        professional documentation.
      </p>

      <div className="mt-6 flex flex-col gap-1.5">
        <label
  htmlFor="technician-notes"
  className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
>
  Technician Notes
</label>

<AutoTextarea
  id="technician-notes"
  minRows={8}
  value={value}
  onChange={(e) => onChange(e.target.value)}
  placeholder={PLACEHOLDER}
  className="w-full resize-y rounded-lg border border-input/80 bg-surface-elevated px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 outline-none transition duration-200 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 focus:shadow-[0_0_0_1px_oklch(0.72_0.18_150_/_0.08)]"
/>
        <span className="self-end text-[11px] tabular-nums text-muted-foreground/70">
          {value.length} characters
        </span>
      </div>

      {isAnalyzing && (
        <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/[0.04] px-4 py-3">
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent"
          />
          <span className="text-sm text-muted-foreground">
            {ANALYZING_MESSAGES[msgIndex]}
          </span>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2.5 border-t border-border/60 pt-4 sm:flex-row">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-48"
        >
          {isAnalyzing ? "Analyzing…" : "Analyze Notes"}
        </button>
        <button
          onClick={onClear}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:w-40"
        >
          Clear Notes
        </button>
      </div>
    </section>
  );
}
