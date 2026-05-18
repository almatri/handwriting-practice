export const MIN_SENTENCE_COUNT = 1;
export const MAX_SENTENCE_COUNT = 10;
export const DEFAULT_SENTENCE_COUNT = 5;

export type GenerationGrade = 1 | 2 | 3;

export type AiProvider = "gemini" | "openrouter";

export type GenerationOptions = {
  language: "english" | "arabic";
  grade: GenerationGrade;
  sentenceCount: number;
  topics?: string[];
};

export type AiProviderMeta = {
  id: AiProvider;
  label: string;
  storageKey: string;
  envVar: "VITE_GEMINI_API_KEY" | "VITE_OPENROUTER_API_KEY";
  keyPlaceholder: string;
  keyHelpUrl: string;
};

export const AI_PROVIDERS: AiProviderMeta[] = [
  {
    id: "gemini",
    label: "Gemini",
    storageKey: "handwriting-gemini-api-key",
    envVar: "VITE_GEMINI_API_KEY",
    keyPlaceholder: "Paste key from Google AI Studio",
    keyHelpUrl: "https://aistudio.google.com/apikey",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    storageKey: "handwriting-openrouter-api-key",
    envVar: "VITE_OPENROUTER_API_KEY",
    keyPlaceholder: "Paste key from openrouter.ai/keys",
    keyHelpUrl: "https://openrouter.ai/keys",
  },
];
