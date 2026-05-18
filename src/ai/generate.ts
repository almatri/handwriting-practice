import { GEMINI_MODEL, generateWithGemini } from "./providers/gemini";
import { OPENROUTER_MODEL, generateWithOpenRouter } from "./providers/openrouter";
import { AI_PROVIDERS, type AiProvider, type GenerationOptions } from "./types";

function modelForProvider(provider: AiProvider): string {
  switch (provider) {
    case "gemini":
      return GEMINI_MODEL;
    case "openrouter":
      return OPENROUTER_MODEL;
  }
}

export async function generatePracticeSentences(
  provider: AiProvider,
  apiKey: string,
  options: GenerationOptions,
): Promise<string[]> {
  const providerLabel = AI_PROVIDERS.find((p) => p.id === provider)?.label ?? provider;
  const model = modelForProvider(provider);
  console.log(`[AI] provider=${providerLabel} (${provider}) model=${model}`);

  switch (provider) {
    case "gemini":
      return generateWithGemini(apiKey, options);
    case "openrouter":
      return generateWithOpenRouter(apiKey, options);
  }
}
