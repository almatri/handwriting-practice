import { buildPrompt, clampSentenceCount } from "../prompt";
import { parseSentencesFromJson } from "../parseSentences";
import type { GenerationOptions } from "../types";

export async function generateWithOpenRouter(
  apiKey: string,
  options: GenerationOptions,
): Promise<string[]> {
  const sentenceCount = clampSentenceCount(options.sentenceCount);
  const prompt = buildPrompt({ ...options, sentenceCount });
  const model = options.model;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (typeof window !== "undefined") {
    headers["HTTP-Referer"] = window.location.origin;
    headers["X-Title"] = "Handwriting Practice";
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 1.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You create handwriting practice sentences for children. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(body?.error?.message ?? `OpenRouter API error (${response.status})`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) throw new Error("No response from OpenRouter");

  return parseSentencesFromJson(rawText, options, "OpenRouter");
}
