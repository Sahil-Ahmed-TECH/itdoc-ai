import type { TicketInput } from "./generate-docs";

export interface KbArticle {
  title: string;
  content: string;
}

const clean = (value: string) => value.trim();

const items = (value: string) =>
  value
    .split("\n")
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);

const bulletList = (value: string) => items(value).map((l) => `- ${l}`).join("\n");

const numberedList = (value: string) =>
  items(value)
    .map((l, i) => `${i + 1}. ${l}`)
    .join("\n");

const commandBlock = (value: string) => value.replace(/^\n+|\s+$/g, "");

const compose = (blocks: (string | null | undefined | false)[]) =>
  blocks.filter(Boolean).join("\n\n").trim();

/** Derive keywords from the provided details only — no invented terms. */
function keywords(input: TicketInput): string[] {
  const stop = new Set([
    "the", "and", "for", "with", "after", "from", "that", "this", "when", "into",
    "was", "are", "not", "user", "issue", "error", "has", "had", "were", "been",
    "their", "them", "they", "you", "your", "all", "any", "but", "can", "could",
  ]);
  const source = [input.issueSummary, input.symptoms, input.deviceName].join(" ");
  const words = source
    .toLowerCase()
    .split(/[^a-z0-9+#._-]+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  return Array.from(new Set(words)).slice(0, 12);
}

/**
 * Extract a root-cause statement from the notes or resolution, if the
 * technician actually recorded one. Nothing is inferred or invented.
 */
function rootCause(input: TicketInput): string {
  const candidates = [...items(input.notes), ...items(input.resolution)];
  const match = candidates.find((line) =>
    /(root cause|caused by|due to|triggered by|stemmed from|because of|was the result of)/i.test(
      line,
    ),
  );
  return match ? clean(match) : "";
}

/** Prevention guidance is only surfaced when the technician recorded advice. */
function prevention(input: TicketInput): string {
  const lines = items(input.notes).filter((line) =>
    /(advise|advised|recommend|prevent|avoid|monitor|remind|before future|going forward|consider|review)/i.test(
      line,
    ),
  );
  return lines.length > 0 ? bulletList(lines.join("\n")) : "";
}

export function generateKnowledgeBase(input: TicketInput): KbArticle {
  const device = clean(input.deviceName);
  const summary = clean(input.issueSummary);
  const resolution = clean(input.resolution);
  const notes = clean(input.notes);
  const symptoms = clean(input.symptoms);
  const steps = clean(input.steps);
  const commands = clean(input.commands);

  const title = summary || "Knowledge Base Article";
  const cause = rootCause(input);
  const prevent = prevention(input);
  const tags = keywords(input);

  // Notes already surfaced as root cause / prevention are not repeated below.
  const remainingNotes = items(notes)
    .filter((line) => line !== cause && !prevent.includes(line))
    .join("\n");

  const content = compose([
    `# ${title}`,
    device && `## Environment\n- ${device}`,
    summary && `## Issue\n${summary}`,
    symptoms && `## Symptoms\n${bulletList(symptoms)}`,
    cause && `## Root Cause\n${cause}`,
    resolution && `## Resolution\n${resolution}`,
    commands && `## Commands Used\n\`\`\`\n${commandBlock(commands)}\n\`\`\``,
    steps && `## Validation Performed\n${numberedList(steps)}`,
    prevent && `## Prevention / Best Practices\n${prevent}`,
    remainingNotes && `## Additional Notes\n${bulletList(remainingNotes)}`,
    tags.length > 0 && `## Keywords\n${tags.join(", ")}`,
  ]);

  return { title, content };
}
