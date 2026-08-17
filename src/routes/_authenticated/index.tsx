import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { emptyTicket, type GeneratedSection, type TicketInput } from "@/lib/generate-docs";
import { documentationService } from "@/lib/doc-service";
import { validateTicket, type RequiredField } from "@/lib/ticket-validation";
import { AutoTextarea } from "@/components/AutoTextarea";
import { QuickCapture } from "@/components/QuickCapture";
import { analyzeNotes } from "@/lib/analyze-notes";
import { blankTemplateId, getIssueTemplate, issueTemplates } from "@/lib/issue-templates";
import { generateKnowledgeBase, type KbArticle } from "@/lib/generate-kb";
import { buildBatFile, downloadBatFile } from "@/lib/bat-export";
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Clipboard, ClipboardCheck, FileText, Pencil, BookOpen, Ticket as TicketIcon, Settings, RefreshCw, ChevronDown, FileDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "ITDoc AI — IT Ticket Documentation Generator" },
      {
        name: "description",
        content:
          "Turn raw troubleshooting notes into professional ticket documentation, end-user updates and knowledge base articles in under a minute.",
      },
      { property: "og:title", content: "ITDoc AI — IT Ticket Documentation Generator" },
      {
        property: "og:description",
        content:
          "Paste rough technician notes and generate editable, copy-ready IT service desk documentation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

interface FieldDef {
  key: keyof TicketInput;
  label: string;
  placeholder: string;
  multiline?: boolean;
  mono?: boolean;
  full?: boolean;
  required?: boolean;
}

const issueFields: FieldDef[] = [
  {
    key: "issueSummary",
    label: "Issue Summary",
    placeholder: "Outlook fails to sync mailbox after password reset",
    multiline: true,
    full: true,
    required: true,
  },
  {
    key: "symptoms",
    label: "Symptoms",
    placeholder: "One per line\nRepeated credential prompts\nSend/receive error 0x8004010F",
    multiline: true,
    full: true,
  },
];

const envFields: FieldDef[] = [
  { key: "userName", label: "User Name", placeholder: "Joel Miller", required: true },
  { key: "deviceName", label: "Device Name", placeholder: "LT-FIN-0421 (Dell Latitude 5540)" },
];

const troubleshootFields: FieldDef[] = [
  {
    key: "steps",
    label: "Troubleshooting Steps Performed",
    placeholder: "One per line\nVerified account status in AD\nCleared cached credentials",
    multiline: true,
    full: true,
  },
  {
    key: "commands",
    label: "Commands Used",
    placeholder: "ipconfig /flushdns\nklist purge",
    multiline: true,
    mono: true,
    full: true,
  },
];

const resolutionFields: FieldDef[] = [
  {
    key: "resolution",
    label: "Resolution",
    placeholder: "Removed stale credential entry and recreated the Outlook profile.",
    multiline: true,
    full: true,
    required: true,
  },
  {
    key: "notes",
    label: "Additional Notes",
    placeholder: "Anything worth flagging for the next technician.",
    multiline: true,
    full: true,
  },
];

const allFields: FieldDef[] = [
  ...issueFields,
  ...envFields,
  ...troubleshootFields,
  ...resolutionFields,
];

const analysedKeys: (keyof TicketInput)[] = [
  "deviceName",
  "issueSummary",
  "symptoms",
  "steps",
  "commands",
  "resolution",
  "notes",
];

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

function SectionCard({
  id,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="h-fit rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-panel)] sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldRenderer({
  field,
  form,
  errors,
  touched,
  update,
  setTouched,
}: {
  field: FieldDef;
  form: TicketInput;
  errors: Partial<Record<RequiredField, string>>;
  touched: Partial<Record<RequiredField, boolean>>;
  update: (key: keyof TicketInput, value: string) => void;
  setTouched: React.Dispatch<React.SetStateAction<Partial<Record<RequiredField, boolean>>>>;
}) {
  const error = errors[field.key as RequiredField];
  const showError = !!error && !!touched[field.key as RequiredField];
  const value = form[field.key];

  return (
    <div className={`flex flex-col gap-1.5 ${field.full ? "sm:col-span-2" : ""}`}>
      <label
        htmlFor={field.key}
        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        {field.label}
        {field.required ? <span aria-hidden className="text-destructive"> *</span> : null}
      </label>
      {field.multiline ? (
        <AutoTextarea
          id={field.key}
          minRows={field.full ? 3 : 4}
          value={value}
          onChange={(e) => update(field.key, e.target.value)}
          onBlur={() =>
            field.required &&
            setTouched((p) => ({ ...p, [field.key as RequiredField]: true }))
          }
          placeholder={field.placeholder}
          aria-invalid={showError || undefined}
          className={`w-full resize-y rounded-lg border border-input bg-surface-elevated px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 ${
            field.mono ? "font-mono text-[13px]" : ""
          } ${showError ? "border-destructive" : ""}`}
        />
      ) : (
        <input
          id={field.key}
          value={value}
          onChange={(e) => update(field.key, e.target.value)}
          onBlur={() =>
            field.required &&
            setTouched((p) => ({ ...p, [field.key as RequiredField]: true }))
          }
          placeholder={field.placeholder}
          aria-invalid={showError || undefined}
          className={`w-full rounded-lg border border-input bg-surface-elevated px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 ${
            showError ? "border-destructive" : ""
          }`}
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] text-destructive">{showError ? error : ""}</p>
        {field.multiline ? (
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
            {value.length} characters
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Index() {
  const [form, setForm] = useState<TicketInput>(emptyTicket);
  const [sections, setSections] = useState<GeneratedSection[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Partial<Record<RequiredField, boolean>>>({});
  const [templateId, setTemplateId] = useState<string>(blankTemplateId);
  const [kb, setKb] = useState<KbArticle | null>(null);
  const [kbEditing, setKbEditing] = useState(false);
  const [rawNotes, setRawNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const errors = useMemo(() => validateTicket(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const update = (key: keyof TicketInput, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const template = getIssueTemplate(id);
    if (!template) return;
    setForm((prev) => ({ ...prev, ...template.fields }));
    setTouched({});
  };

  const buildOutputs = (ticket: TicketInput) => {
    void documentationService.generate(ticket).then((result) => {
      setSections(result);
      setEditing({});
    });
    setKb(generateKnowledgeBase(ticket));
    setKbEditing(false);
    setCopied(null);
  };

  const handleAnalyze = async () => {
    if (!rawNotes.trim()) {
      toast.error("Add some notes first", {
        description: "Paste your rough troubleshooting notes and we'll organize them for you.",
      });
      return;
    }

    const hasExistingContent = analysedKeys.some((key) => form[key].trim().length > 0);
    if (
      hasExistingContent &&
      typeof window !== "undefined" &&
      !window.confirm("Analyzing will replace the details already in the form. Continue?")
    ) {
      return;
    }

    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 450));

    const analysis = analyzeNotes(rawNotes);
    setIsAnalyzing(false);

    if (!analysis) {
      toast.error("Nothing to analyze", { description: "Those notes didn't contain any detail." });
      return;
    }

    const { deviceName, ...rest } = analysis.fields;
    const next: TicketInput = {
      ...form,
      ...rest,
      deviceName: deviceName || form.deviceName,
    };
    setForm(next);
    setTouched({});
    setTemplateId(blankTemplateId);

    if (validateTicket(next).userName) {
      toast.success(`Organized ${analysis.lineCount} notes`, {
        description: "Add the user's name to generate the full documentation set.",
      });
      return;
    }

    buildOutputs(next);
    toast.success(`Organized ${analysis.lineCount} notes into documentation`, {
      description: "Review and edit any section before copying.",
    });
  };

  const handleClearNotes = () => {
    setRawNotes("");
    toast.success("Notes cleared");
  };

  const handleCreateBat = () => {
    if (!sections) return;
    const batContent = buildBatFile(sections);
    if (!batContent.trim()) {
      toast.error("No executable Windows commands were found to create a .BAT file.");
      return;
    }
    downloadBatFile(batContent, "ITDoc-AI-Resolution.bat");
    toast.success("BAT file created successfully.");
  };

  const handleGenerate = async () => {
    if (!isValid) return;
    setSections(await documentationService.generate(form));
    setCopied(null);
    setEditing({});
    toast.success("Documentation generated", { description: "Every section is editable." });
  };

  const handleGenerateKb = () => {
    if (!isValid) return;
    setKb(generateKnowledgeBase(form));
    setKbEditing(false);
    setCopied(null);
    toast.success("Knowledge base article generated");
  };

  const handleClear = () => {
    setForm(emptyTicket);
    setSections(null);
    setKb(null);
    setKbEditing(false);
    setCopied(null);
    setEditing({});
    setTouched({});
    setTemplateId(blankTemplateId);
    toast.success("Form cleared");
  };

  const copyText = async (id: string, text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800);
    } catch {
      setCopied(null);
      toast.error("Couldn't copy to clipboard");
    }
  };

  const copyAll = () => {
    if (!sections) return;
    copyText("__all__", documentationService.buildDocument(sections, form), "Full documentation");
  };

  const editSection = (id: string, content: string) =>
    setSections((prev) => prev?.map((s) => (s.id === id ? { ...s, content } : s)) ?? prev);

  return (
    <div id="top" className="min-h-full bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Dashboard</h1>
            <span className="rounded-full border border-border bg-surface-elevated px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              IT Service Desk
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Capture raw notes, generate professional documentation, and build your knowledge base.
          </p>
        </div>

        {/* Quick Capture */}
        <div id="quick-capture" className="mb-6">
          <QuickCapture
            value={rawNotes}
            onChange={setRawNotes}
            onAnalyze={handleAnalyze}
            onClear={handleClearNotes}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* Left: Ticket details form */}
          <div id="ticket-details" className="flex flex-col gap-6">
            {/* Template selector */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-panel)]">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight">Issue Template</h2>
                  <p className="text-xs text-muted-foreground">
                    Pre-fills starter content — every field stays editable.
                  </p>
                </div>
              </div>
              <div className="relative">
  <select
    id="issue-template"
    value={templateId}
    onChange={(e) => applyTemplate(e.target.value)}
    className="w-full appearance-none rounded-lg border border-input bg-surface-elevated px-3 py-2 pr-10 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
  >
    {issueTemplates.map((t) => (
      <option key={t.id} value={t.id}>
        {t.label}
      </option>
    ))}
  </select>

  <ChevronDown
    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
    aria-hidden="true"
  />
</div>
            </div>

            {/* Issue section */}
            <SectionCard
              id="issue-section"
              icon={AlertCircle}
              title="Issue"
              description="What was reported and the symptoms observed."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {issueFields.map((field) => (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    form={form}
                    errors={errors}
                    touched={touched}
                    update={update}
                    setTouched={setTouched}
                  />
                ))}
              </div>
            </SectionCard>

            {/* Environment section */}
            <SectionCard
              id="environment-section"
              icon={TicketIcon}
              title="Environment"
              description="Who and what is affected."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {envFields.map((field) => (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    form={form}
                    errors={errors}
                    touched={touched}
                    update={update}
                    setTouched={setTouched}
                  />
                ))}
              </div>
            </SectionCard>

            {/* Troubleshooting section */}
            <SectionCard
              id="troubleshooting-section"
              icon={RefreshCw}
              title="Troubleshooting"
              description="Steps taken and commands used."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {troubleshootFields.map((field) => (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    form={form}
                    errors={errors}
                    touched={touched}
                    update={update}
                    setTouched={setTouched}
                  />
                ))}
              </div>
            </SectionCard>

            {/* Resolution section */}
            <SectionCard
              id="resolution-section"
              icon={CheckCircle2}
              title="Resolution"
              description="How the issue was resolved and any follow-up notes."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {resolutionFields.map((field) => (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    form={form}
                    errors={errors}
                    touched={touched}
                    update={update}
                    setTouched={setTouched}
                  />
                ))}
              </div>
            </SectionCard>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={handleGenerate} disabled={!isValid} className={`${btnPrimary} flex-1`}>
                Generate Documentation
              </button>
              <button
                onClick={handleGenerateKb}
                disabled={!isValid}
                className={`${btnPrimary} flex-1`}
              >
                Generate Knowledge Base
              </button>
              <button onClick={handleClear} className={btnGhost}>
                Clear Form
              </button>
            </div>
          </div>

          {/* Right: Generated documentation */}
          <div id="documentation" className="flex flex-col gap-6">
            {!sections ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <h2 className="text-base font-semibold">No documentation yet</h2>
                <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Paste your notes into Quick Capture, or complete the ticket details and hit
                  Generate Documentation to produce editable, copy-ready sections.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    {sections.length} sections generated — edit any section before copying.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      onClick={handleCreateBat}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <FileDown className="h-3.5 w-3.5" /> Create .BAT File
                    </button>
                    <button
                      onClick={copyAll}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      {copied === "__all__" ? (
                        <>
                          <ClipboardCheck className="h-3.5 w-3.5" /> Copied all
                        </>
                      ) : (
                        <>
                          <Clipboard className="h-3.5 w-3.5" /> Copy All Documentation
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {sections.map((section) => {
                  const isEditing = !!editing[section.id];
                  return (
                    <article
                      key={section.id}
                      className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-panel)]"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold tracking-tight">{section.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setEditing((prev) => ({ ...prev, [section.id]: !isEditing }))
                            }
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition hover:bg-muted"
                          >
                            <Pencil className="h-3 w-3" />
                            {isEditing ? "Done" : "Edit"}
                          </button>
                          <button
                            onClick={() => copyText(section.id, section.content, section.title)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition hover:bg-muted"
                          >
                            {copied === section.id ? (
                              <>
                                <ClipboardCheck className="h-3 w-3" /> Copied
                              </>
                            ) : (
                              <>
                                <Clipboard className="h-3 w-3" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      {isEditing ? (
                        <textarea
                          value={section.content}
                          onChange={(e) => editSection(section.id, e.target.value)}
                          rows={Math.min(24, section.content.split("\n").length + 2)}
                          aria-label={`${section.title} editor`}
                          className="w-full resize-y rounded-lg border border-input bg-surface-elevated px-3 py-2.5 font-mono text-[13px] leading-relaxed text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                        />
                      ) : (
                        <pre className="w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-surface-elevated px-3 py-2.5 font-mono text-[13px] leading-relaxed text-foreground">
                          {section.content}
                        </pre>
                      )}
                    </article>
                  );
                })}
              </>
            )}

            {/* Knowledge Base */}
            {kb && (
              <article
                id="knowledge-base"
                className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-panel)]"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold tracking-tight">Knowledge Base</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setKbEditing((v) => !v)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition hover:bg-muted"
                    >
                      <Pencil className="h-3 w-3" />
                      {kbEditing ? "Done" : "Edit"}
                    </button>
                    <button
                      onClick={() => copyText("__kb__", kb.content, "Knowledge base article")}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground transition hover:bg-muted"
                    >
                      {copied === "__kb__" ? (
                        <>
                          <ClipboardCheck className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Clipboard className="h-3 w-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {kbEditing ? (
                  <textarea
                    value={kb.content}
                    onChange={(e) =>
                      setKb((prev) => (prev ? { ...prev, content: e.target.value } : prev))
                    }
                    rows={Math.min(30, kb.content.split("\n").length + 2)}
                    aria-label="Knowledge Base editor"
                    className="w-full resize-y rounded-lg border border-input bg-surface-elevated px-3 py-2.5 font-mono text-[13px] leading-relaxed text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                  />
                ) : (
                  <pre className="w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-surface-elevated px-3 py-2.5 font-mono text-[13px] leading-relaxed text-foreground">
                    {kb.content}
                  </pre>
                )}
              </article>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
