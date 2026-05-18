import { buildPrompt, clampSentenceCount } from "../prompt";
import { parseSentencesFromJson } from "../parseSentences";
import type { GenerationOptions } from "../types";

export const GEMINI_MODEL =
  import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-flash-latest";

export async function generateWithGemini(
  apiKey: string,
  options: GenerationOptions,
): Promise<string[]> {
  const sentenceCount = clampSentenceCount(options.sentenceCount);
  const prompt = buildPrompt({ ...options, sentenceCount });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.5,
          topP: 0.95,
          topK: 40,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(body?.error?.message ?? `Gemini API error (${response.status})`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("No response from Gemini");

  return parseSentencesFromJson(rawText, options, "Gemini");
}
