import type { TicketInput } from "./generate-docs";

/**
 * Heuristic note analyser.
 *
 * Turns raw, unstructured technician notes into the structured ticket fields
 * used across the app. It never invents facts — every output line comes from
 * the technician's own text, only re-ordered, cleaned and classified.
 *
 * The rule sets below are data-driven so new signals can be added without
 * touching the classification logic.
 */

export interface AnalyzedNotes {
  fields: Pick<
    TicketInput,
    "issueSummary" | "symptoms" | "steps" | "commands" | "resolution" | "notes"
  > & { deviceName?: string };
  lineCount: number;
}

const stripMarker = (line: string) =>
  line.replace(/^\s*(?:[-*•·>]|\d+[.)])\s*/, "").replace(/\s+$/, "").trim();

const sentenceCase = (line: string) => {
  const t = line.trim();
  if (!t) return t;
  // Leave command-like or already-capitalised text untouched.
  if (/^[A-Z0-9]/.test(t)) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/** Lines that look like shell / PowerShell / CLI invocations. */
const COMMAND_PATTERNS: RegExp[] = [
  /^(?:PS\s+)?[A-Z]:\\/i,
  /^\$\s+/,
  /^(?:sudo|ipconfig|ping|nslookup|netsh|net\s|sfc|dism|gpupdate|klist|cmdkey|msiexec|reg\s|sc\s|wmic|tracert|route|arp|chkdsk|manage-bde|dsregcmd|w32tm|cscript|mdmdiagnosticstool|winget|choco|robocopy|icacls|takeown|dcdiag|repadmin|certutil|nltest|whoami|systeminfo|tasklist|taskkill|shutdown|powershell|cmd|bash|curl|ssh|scp|python|node|npm|git)\b/i,
  /^(?:Get|Set|New|Remove|Add|Restart|Start|Stop|Test|Connect|Disconnect|Enable|Disable|Update|Reset|Revoke|Repair|Clear|Invoke|Export|Import|Search|Suspend|Resume|Grant|Sync)-[A-Za-z]+/,
  /^[\w./-]+\.(?:exe|ps1|bat|cmd|msi|vbs)\b/i,
];

const RESOLUTION_HINTS = [
  "resolved",
  "resolution",
  "fixed",
  "fix applied",
  "issue no longer",
  "working now",
  "works now",
  "opened successfully",
  "signed in successfully",
  "confirmed working",
  "restored",
  "back to normal",
  "successful",
  "success",
  "no further",
  "verified working",
];

const SYMPTOM_HINTS = [
  "error",
  "unable",
  "cannot",
  "can't",
  "failing",
  "fails",
  "failed to",
  "not working",
  "no access",
  "denied",
  "prompt",
  "prompting",
  "crash",
  "freezes",
  "slow",
  "disconnect",
  "offline",
  "stuck",
  "0x",
  "warning",
  "greyed out",
  "missing",
  "blocked",
  "locked",
  "reports",
  "reported",
  "complain",
];

const STEP_HINTS = [
  "checked",
  "check",
  "verified",
  "verify",
  "tested",
  "tried",
  "attempted",
  "ran",
  "run",
  "restarted",
  "rebooted",
  "cleared",
  "clear",
  "removed",
  "recreated",
  "reinstalled",
  "installed",
  "updated",
  "reset",
  "repaired",
  "performed",
  "reviewed",
  "escalated",
  "disabled",
  "enabled",
  "rejoined",
  "flushed",
  "logged",
  "raised",
  "verified identity",
];

const NOTE_HINTS = [
  "note",
  "fyi",
  "follow up",
  "follow-up",
  "monitor",
  "advise",
  "advised",
  "recommend",
  "root cause",
  "caused by",
  "known issue",
  "kb",
  "asset tag",
  "ticket ref",
];

/** Device-ish tokens: asset tags, hostnames, common hardware names. */
const DEVICE_PATTERNS: RegExp[] = [
  /\b(?:[A-Z]{2,4}-[A-Z0-9]{2,6}-\d{2,5})\b/,
  /\b(?:laptop|desktop|workstation|surface|latitude|elitebook|thinkpad|macbook|iphone|ipad|android)\b/i,
];

const hasAny = (haystack: string, needles: string[]) =>
  needles.some((n) => haystack.includes(n));

const isCommand = (line: string) => COMMAND_PATTERNS.some((r) => r.test(line));

type Bucket = "symptoms" | "steps" | "commands" | "resolution" | "notes";

function classify(line: string, index: number, total: number): Bucket {
  if (isCommand(line)) return "commands";
  const l = line.toLowerCase();

  const labelled = /^(symptom|issue|error|problem)s?\s*[:—-]/i.test(line)
    ? "symptoms"
    : /^(step|action|troubleshoot\w*|performed)\s*[:—-]/i.test(line)
      ? "steps"
      : /^(resolution|fix|outcome|result)\s*[:—-]/i.test(line)
        ? "resolution"
        : /^(note|notes|follow[- ]?up|root cause)\s*[:—-]/i.test(line)
          ? "notes"
          : null;
  if (labelled) return labelled;

  if (hasAny(l, RESOLUTION_HINTS)) {
    // Late-positioned success statements are the resolution; earlier ones are steps.
    if (index >= total - 3 || hasAny(l, ["resolution", "resolved", "fix applied"]))
      return "resolution";
  }
  if (hasAny(l, NOTE_HINTS)) return "notes";
  if (hasAny(l, SYMPTOM_HINTS)) return "symptoms";
  if (hasAny(l, STEP_HINTS)) return "steps";
  // Default: earlier lines describe the problem, later lines describe the work.
  return index < Math.max(1, Math.floor(total / 3)) ? "symptoms" : "steps";
}

function detectDevice(lines: string[]): string {
  for (const line of lines) {
    for (const pattern of DEVICE_PATTERNS) {
      const match = line.match(pattern);
      if (match) return match[0];
    }
  }
  return "";
}

/** Build a concise, professional one-line issue summary from the strongest symptom. */
function buildSummary(symptoms: string[], all: string[]): string {
  const source = symptoms[0] ?? all[0] ?? "";
  const cleaned = source
    .replace(/^(?:symptom|issue|error|problem)s?\s*[:—-]\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  const withoutTrailing = cleaned.replace(/[.;]+$/, "");
  return sentenceCase(withoutTrailing);
}

export function analyzeNotes(raw: string): AnalyzedNotes | null {
  const lines = raw
    .split(/\r?\n/)
    .flatMap((l) => (l.includes(" • ") ? l.split(" • ") : [l]))
    .map(stripMarker)
    .filter(Boolean);

  if (lines.length === 0) return null;

  const buckets: Record<Bucket, string[]> = {
    symptoms: [],
    steps: [],
    commands: [],
    resolution: [],
    notes: [],
  };

  lines.forEach((line, i) => {
    const bucket = classify(line, i, lines.length);
    buckets[bucket].push(bucket === "commands" ? line : sentenceCase(line));
  });

  // Guarantee at least one symptom so the documentation reads coherently.
  if (buckets.symptoms.length === 0 && buckets.steps.length > 0) {
    buckets.symptoms.push(buckets.steps.shift()!);
  }

  const resolution = buckets.resolution.join(" ").replace(/\s+/g, " ").trim();

  return {
    lineCount: lines.length,
    fields: {
      issueSummary: buildSummary(buckets.symptoms, lines),
      symptoms: buckets.symptoms.join("\n"),
      steps: buckets.steps.join("\n"),
      commands: buckets.commands.join("\n"),
      resolution,
      notes: buckets.notes.join("\n"),
      deviceName: detectDevice(lines),
    },
  };
}
