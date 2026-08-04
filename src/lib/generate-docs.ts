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

const fallback = (value: string, alt: string) => (value.trim() ? value.trim() : alt);

const bullets = (value: string, alt: string) => {
  const lines = value
    .split("\n")
    .map((l) => l.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);
  if (!lines.length) return `- ${alt}`;
  return lines.map((l) => `- ${l}`).join("\n");
};

const numbered = (value: string, alt: string) => {
  const lines = value
    .split("\n")
    .map((l) => l.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);
  if (!lines.length) return `1. ${alt}`;
  return lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
};

export interface GeneratedSection {
  id: string;
  title: string;
  content: string;
}

export function generateDocumentation(input: TicketInput): GeneratedSection[] {
  const user = fallback(input.userName, "End user");
  const device = fallback(input.deviceName, "assigned workstation");
  const summary = fallback(input.issueSummary, "Reported issue affecting normal device operation");
  const resolution = fallback(input.resolution, "Issue resolved and service restored");
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return [
    {
      id: "ticket-description",
      title: "Ticket Description",
      content: `Reported by: ${user}
Device: ${device}
Date logged: ${date}

Summary
${summary}

Reported symptoms
${bullets(input.symptoms, "No specific symptoms captured at intake.")}

Impact
The issue affected ${user}'s ability to work normally on ${device} until support intervention was completed.`,
    },
    {
      id: "resolution-summary",
      title: "Resolution Summary",
      content: `Issue: ${summary}
Device: ${device}
Status: Resolved

Actions performed
${numbered(input.steps, "Standard triage and verification performed.")}

Resolution
${resolution}

Verification
Functionality was confirmed with ${user} after the fix, and no recurrence was observed during post-resolution checks.`,
    },
    {
      id: "internal-notes",
      title: "Internal Technical Notes",
      content: `Technical breakdown for ${device}.

Diagnostics / troubleshooting path
${numbered(input.steps, "Baseline diagnostics executed.")}

Commands executed
${input.commands.trim() ? input.commands.trim() : "(no commands recorded)"}

Observations
${bullets(input.symptoms, "No anomalies logged beyond the reported issue.")}

Additional notes
${fallback(input.notes, "None.")}

Follow-up: monitor ${device} for recurrence; escalate to tier 2 if the same symptoms return within 7 days.`,
    },
    {
      id: "end-user-update",
      title: "End User Update",
      content: `Hi ${user},

Thanks for your patience while we looked into the issue on your ${device}.

What was happening: ${summary}

What we did: ${resolution}

Your device should now be working as expected. If you notice anything similar again, just reply to this ticket and we'll pick it straight back up.

Best regards,
IT Support`,
    },
    {
      id: "kb-article",
      title: "Knowledge Base Article Draft",
      content: `Title: ${summary}

Applies to: ${device}

Symptoms
${bullets(input.symptoms, "Device does not behave as expected.")}

Cause
Based on the troubleshooting performed, the behaviour was traced to the condition addressed by the resolution below.

Resolution steps
${numbered(input.steps, "Run standard diagnostics for the affected component.")}

Reference commands
${input.commands.trim() ? input.commands.trim() : "(none)"}

Outcome
${resolution}

Notes
${fallback(input.notes, "No additional notes.")}`,
    },
  ];
}
