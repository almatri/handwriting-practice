import type { AiProvider } from "./types";

export type FreeModelOption = {
  id: string;
  label: string;
};

/** Models with free-tier access on Google AI Studio (text / JSON generation). */
export const GEMINI_FREE_MODELS: FreeModelOption[] = [
  { id: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash-Lite (preview)" },
  { id: "gemini-flash-latest", label: "Gemini Flash (latest)" },
  { id: "gemini-flash-lite-latest", label: "Gemini Flash-Lite (latest)" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { id: "gemini-2.0-flash-001", label: "Gemini 2.0 Flash 001" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash-Lite" },
  { id: "gemini-2.0-flash-lite-001", label: "Gemini 2.0 Flash-Lite 001" },
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash (preview)" },
  { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite" },
  { id: "gemma-4-26b-a4b-it", label: "Gemma 4 26B" },
  { id: "gemma-4-31b-it", label: "Gemma 4 31B" },
];

const OPENROUTER_FREE_FALLBACK: FreeModelOption[] = [
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B Instruct (free)" },
  { id: "qwen/qwen3-next-80b-a3b-instruct:free", label: "Qwen3 Next 80B Instruct (free)" },
  { id: "openai/gpt-oss-120b:free", label: "gpt-oss 120B (free)" },
  { id: "openai/gpt-oss-20b:free", label: "gpt-oss 20B (free)" },
  { id: "google/gemma-4-26b-a4b-it:free", label: "Gemma 4 26B (free)" },
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B (free)" },
  { id: "deepseek/deepseek-v4-flash:free", label: "DeepSeek V4 Flash (free)" },
  { id: "meta-llama/llama-3.2-3b-instruct:free", label: "Llama 3.2 3B Instruct (free)" },
  { id: "qwen/qwen3-coder:free", label: "Qwen3 Coder 480B (free)" },
  { id: "z-ai/glm-4.5-air:free", label: "GLM 4.5 Air (free)" },
];

const MODEL_STORAGE_KEY: Record<AiProvider, string> = {
  gemini: "handwriting-gemini-model",
  openrouter: "handwriting-openrouter-model",
};

const ENV_MODEL: Record<AiProvider, string | undefined> = {
  gemini: import.meta.env.VITE_GEMINI_MODEL?.trim() || undefined,
  openrouter: import.meta.env.VITE_OPENROUTER_MODEL?.trim() || undefined,
};

export function freeModelsForProvider(provider: AiProvider): FreeModelOption[] {
  return provider === "gemini" ? GEMINI_FREE_MODELS : OPENROUTER_FREE_FALLBACK;
}

function pickValidModel(provider: AiProvider, options: FreeModelOption[], stored?: string): string {
  const env = ENV_MODEL[provider];
  if (env && options.some((o) => o.id === env)) return env;
  if (stored && options.some((o) => o.id === stored)) return stored;
  return options[0]!.id;
}

export function getStoredModel(provider: AiProvider, options: FreeModelOption[]): string {
  const stored = localStorage.getItem(MODEL_STORAGE_KEY[provider])?.trim();
  return pickValidModel(provider, options, stored);
}

export function setStoredModel(provider: AiProvider, modelId: string): void {
  localStorage.setItem(MODEL_STORAGE_KEY[provider], modelId);
}

function isTextFreeOpenRouterModel(id: string): boolean {
  const low = id.toLowerCase();
  if (!low.endsWith(":free")) return false;
  return !["whisper", "orpheus", "tts", "playai"].some((s) => low.includes(s));
}

export async function fetchOpenRouterFreeModels(): Promise<FreeModelOption[]> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models");
    if (!response.ok) return OPENROUTER_FREE_FALLBACK;

    const data = (await response.json()) as {
      data?: Array<{ id?: string; name?: string }>;
    };

    const models = (data.data ?? [])
      .filter((m) => m.id && isTextFreeOpenRouterModel(m.id))
      .map((m) => ({
        id: m.id!,
        label: m.name?.trim() || m.id!,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return models.length > 0 ? models : OPENROUTER_FREE_FALLBACK;
  } catch {
    return OPENROUTER_FREE_FALLBACK;
  }
}
