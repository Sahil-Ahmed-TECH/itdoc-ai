import { AutoTextarea } from "@/components/AutoTextarea";

const PLACEHOLDER = `Example:
• User unable to sign in to Outlook
• Error: Cannot expand the folder
• Recreated Outlook profile
• Cleared OST cache
• Performed Office Quick Repair
• Outlook opened successfully`;

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
  return (
    <section
      aria-label="Quick Capture"
      className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-panel)] sm:p-6"
    >
      <h2 className="text-base font-semibold tracking-tight">Quick Capture</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Paste your raw troubleshooting notes and let ITDoc AI organize them into professional
        documentation.
      </p>

      <div className="mt-5 flex flex-col gap-1.5">
        <label
          htmlFor="technician-notes"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          Paste Technician Notes
        </label>
        <AutoTextarea
          id="technician-notes"
          minRows={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={PLACEHOLDER}
          className="w-full resize-y rounded-lg border border-input bg-surface-elevated px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <span className="self-end text-[11px] tabular-nums text-muted-foreground/70">
          {value.length} characters
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-48"
        >
          {isAnalyzing ? (
            <>
              <span
                aria-hidden
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
              Analyzing…
            </>
          ) : (
            "Analyze Notes"
          )}
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
