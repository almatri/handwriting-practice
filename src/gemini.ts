const GEMINI_API_KEY_STORAGE = "handwriting-gemini-api-key";
/** Matches models available on the free tier (e.g. gemini-flash-latest). */
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-flash-latest";
const SENTENCE_COUNT = 5;

export function getGeminiApiKey(): string {
  const fromEnv = import.meta.env.VITE_GEMINI_API_KEY;
  if (typeof fromEnv === "string" && fromEnv.trim()) return fromEnv.trim();
  return localStorage.getItem(GEMINI_API_KEY_STORAGE)?.trim() ?? "";
}

export function setGeminiApiKey(key: string): void {
  const trimmed = key.trim();
  if (trimmed) localStorage.setItem(GEMINI_API_KEY_STORAGE, trimmed);
  else localStorage.removeItem(GEMINI_API_KEY_STORAGE);
}

type GenerateResponse = { sentences?: unknown };

export async function generatePracticeSentences(
  apiKey: string,
  language: "english" | "arabic",
): Promise<string[]> {
  const languageInstruction =
    language === "arabic"
      ? "Write all sentences in Modern Standard Arabic suitable for children."
      : "Write all sentences in English.";

  const prompt = `You create handwriting practice worksheets for elementary school children.

${languageInstruction}

Generate exactly ${SENTENCE_COUNT} short, cheerful sentences (about 5–12 words each). Use simple vocabulary and varied topics (animals, nature, friends, school, hobbies).

In each sentence, bold exactly one important word by wrapping it in **double asterisks**, e.g. The **happy** dog runs fast.

Return JSON only, with this shape: {"sentences":["sentence 1",...]}`;

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
          temperature: 1.1,
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

  let parsed: GenerateResponse;
  try {
    parsed = JSON.parse(rawText) as GenerateResponse;
  } catch {
    throw new Error("Could not parse sentences from Gemini");
  }

  if (!Array.isArray(parsed.sentences)) {
    throw new Error("Invalid sentence format from Gemini");
  }

  const sentences = parsed.sentences
    .filter((s): s is string => typeof s === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) {
    throw new Error("Gemini returned no usable sentences");
  }

  return sentences.slice(0, SENTENCE_COUNT);
}
