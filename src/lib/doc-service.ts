import {
  buildFullDocument,
  generateDocumentation,
  type GeneratedSection,
  type TicketInput,
} from "./generate-docs";

/**
 * Documentation generation service boundary.
 *
 * The UI only ever talks to `documentationService`. Swapping the current
 * mock generator for an OpenAI-compatible API later means implementing this
 * same interface (e.g. an `AiDocumentationGenerator` that calls a server
 * function which hits the AI gateway) and passing it to `setDocumentationGenerator`.
 */
export interface DocumentationGenerator {
  readonly name: string;
  generate(input: TicketInput): Promise<GeneratedSection[]>;
  buildDocument(sections: GeneratedSection[], input: TicketInput): string;
}

export const mockDocumentationGenerator: DocumentationGenerator = {
  name: "mock",
  async generate(input) {
    return generateDocumentation(input);
  },
  buildDocument(sections, input) {
    return buildFullDocument(sections, input);
  },
};

let activeGenerator: DocumentationGenerator = mockDocumentationGenerator;

export function setDocumentationGenerator(generator: DocumentationGenerator) {
  activeGenerator = generator;
}

export function getDocumentationGenerator(): DocumentationGenerator {
  return activeGenerator;
}

export const documentationService = {
  generate: (input: TicketInput) => activeGenerator.generate(input),
  buildDocument: (sections: GeneratedSection[], input: TicketInput) =>
    activeGenerator.buildDocument(sections, input),
};

export type { GeneratedSection, TicketInput };
