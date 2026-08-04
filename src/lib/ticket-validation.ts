import type { TicketInput } from "./generate-docs";

export const requiredFields = ["userName", "issueSummary", "resolution"] as const;

export type RequiredField = (typeof requiredFields)[number];

const messages: Record<RequiredField, string> = {
  userName: "User name is required.",
  issueSummary: "Issue summary is required.",
  resolution: "Resolution is required.",
};

export function validateTicket(input: TicketInput): Partial<Record<RequiredField, string>> {
  const errors: Partial<Record<RequiredField, string>> = {};
  for (const key of requiredFields) {
    if (!input[key].trim()) errors[key] = messages[key];
  }
  return errors;
}

export const isTicketValid = (input: TicketInput) =>
  Object.keys(validateTicket(input)).length === 0;
