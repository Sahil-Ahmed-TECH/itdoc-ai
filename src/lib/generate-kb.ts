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
    "was", "are", "not", "但", "user", "issue", "error",
  ]);
  const source = [input.issueSummary, input.symptoms, input.deviceName].join(" ");
  const words = source
    .toLowerCase()
    .split(/[^a-z0-9+#._-]+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  return Array.from(new Set(words)).slice(0, 12);
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
  const tags = keywords(input);

  const content = compose([
    `# ${title}`,
    summary && `## Summary\n${summary}`,
    device && `## Environment / Affected System\n- ${device}`,
    symptoms && `## Symptoms\n${bulletList(symptoms)}`,
    notes && `## Root Cause\n${notes}`,
    resolution && `## Resolution\n${resolution}`,
    commands && `## Commands Used\n\`\`\`\n${commandBlock(commands)}\n\`\`\``,
    steps && `## Verification Steps\n${numberedList(steps)}`,
    notes && `## Additional Notes\n${notes}`,
    tags.length > 0 && `## Keywords\n${tags.join(", ")}`,
  ]);

  return { title, content };
}
