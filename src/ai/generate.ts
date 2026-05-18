import { generateWithGemini } from "./providers/gemini";
import { generateWithOpenRouter } from "./providers/openrouter";
import { AI_PROVIDERS, type AiProvider, type GenerationOptions } from "./types";

export async function generatePracticeSentences(
  provider: AiProvider,
  apiKey: string,
  options: GenerationOptions,
): Promise<string[]> {
  const providerLabel = AI_PROVIDERS.find((p) => p.id === provider)?.label ?? provider;
  console.log(`[AI] provider=${providerLabel} (${provider}) model=${options.model}`);

  switch (provider) {
    case "gemini":
      return generateWithGemini(apiKey, options);
    case "openrouter":
      return generateWithOpenRouter(apiKey, options);
  }
}
