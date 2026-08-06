export interface TicketInput {
  userName: string;
  deviceName: string;
  issueSummary: string;
  symptoms: string;
  steps: string;
  commands: string;
  resolution: string;
  notes: string;
}

export const emptyTicket: TicketInput = {
  userName: "",
  deviceName: "",
  issueSummary: "",
  symptoms: "",
  steps: "",
  commands: "",
  resolution: "",
  notes: "",
};

export interface GeneratedSection {
  id: string;
  title: string;
  content: string;
}

const clean = (value: string) => value.trim();
const has = (value: string) => clean(value).length > 0;

/** Split a multi-line field into clean items, stripping any existing list markers. */
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

/** Preserve commands exactly as entered, only trimming surrounding blank lines. */
const commandBlock = (value: string) => value.replace(/^\n+|\s+$/g, "");

/** Join non-empty blocks with a single blank line between them. */
const compose = (blocks: (string | null | undefined | false)[]) =>
  blocks.filter(Boolean).join("\n\n").trim();

export function generateDocumentation(input: TicketInput): GeneratedSection[] {
  const user = clean(input.userName);
  const device = clean(input.deviceName);
  const summary = clean(input.issueSummary);
  const resolution = clean(input.resolution);
  const notes = clean(input.notes);
  const date = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  const meta = compose([
    user && `**Reported by:** ${user}`,
    device && `**Affected device:** ${device}`,
    `**Date logged:** ${date}`,
  ]);

  const sections: GeneratedSection[] = [];

  // 1. Ticket Description
  sections.push({
    id: "ticket-description",
    title: "Ticket Description",
    content: compose([
      "## Ticket Description",
      meta,
      summary && `**Issue**\n${summary}`,
      has(input.symptoms) && `**Reported symptoms**\n${bulletList(input.symptoms)}`,
    ]),
  });

  // 2. Troubleshooting Performed
  if (has(input.steps) || has(input.commands)) {
    sections.push({
      id: "troubleshooting-performed",
      title: "Troubleshooting Performed",
      content: compose([
        "## Troubleshooting Performed",
        has(input.steps) && numberedList(input.steps),
        has(input.commands) &&
          `**Commands executed**\n\`\`\`\n${commandBlock(input.commands)}\n\`\`\``,
      ]),
    });
  }

  // 3. Resolution
  if (resolution) {
    sections.push({
      id: "resolution",
      title: "Resolution",
      content: compose([
        "## Resolution",
        resolution,
        `**Status:** Resolved — service verified as operational${user ? ` with ${user}` : ""}.`,
      ]),
    });
  }

  // 4. End User Update
  sections.push({
    id: "end-user-update",
    title: "End User Update",
    content: compose([
      "## End User Update",
      user ? `Hi ${user},` : "Hello,",
      summary
        ? `Thanks for reporting the issue${device ? ` on ${device}` : ""}. We have completed our investigation into the following: ${summary}`
        : `Thanks for your patience while we worked on your ticket${device ? ` for ${device}` : ""}.`,
      resolution && `**What we did**\n${resolution}`,
      "Your service has been restored and tested. If the problem returns, reply to this ticket and we will reopen it immediately.",
      "Kind regards,\nIT Service Desk",
    ]),
  });

  // 5. Internal Technical Notes
  if (has(input.symptoms) || has(input.commands) || notes || resolution) {
    sections.push({
      id: "internal-notes",
      title: "Internal Technical Notes",
      content: compose([
        "## Internal Technical Notes",
        has(input.symptoms) && `**Observations**\n${bulletList(input.symptoms)}`,
        resolution && `**Root cause / fix applied**\n${resolution}`,
        has(input.commands) &&
          `**Reference commands**\n\`\`\`\n${commandBlock(input.commands)}\n\`\`\``,
        notes && `**Additional notes**\n${notes}`,
        `**Follow-up**\nMonitor${device ? ` ${device}` : ""} for recurrence; escalate to Tier 2 if the same behaviour is reported within 7 days.`,
      ]),
    });
  }

  // 6. Knowledge Base Draft
  sections.push({
    id: "kb-draft",
    title: "Knowledge Base Draft",
    content: compose([
      `## ${summary || "Knowledge Base Draft"}`,
      device && `**Applies to:** ${device}`,
      has(input.symptoms) && `**Symptoms**\n${bulletList(input.symptoms)}`,
      has(input.steps) && `**Diagnostic steps**\n${numberedList(input.steps)}`,
      has(input.commands) && `**Commands**\n\`\`\`\n${commandBlock(input.commands)}\n\`\`\``,
      resolution && `**Resolution**\n${resolution}`,
      notes && `**Notes**\n${notes}`,
    ]),
  });

  return sections;
}

export function buildFullDocument(sections: GeneratedSection[], input: TicketInput) {
  const title = clean(input.issueSummary) || "IT Support Ticket Documentation";
  return compose([`# ${title}`, ...sections.map((s) => s.content), "---"]);
}
