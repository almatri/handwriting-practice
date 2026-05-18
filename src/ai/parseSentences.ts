import { clampSentenceCount } from "./prompt";
import type { GenerationOptions } from "./types";

type GenerateResponse = { sentences?: unknown };

const SENTENCE_END_PUNCTUATION = /[.?!؟…]$/;

/** Append "." when the sentence has no terminal punctuation (keeps "?" / "!" as-is). */
export function ensureSentenceEndsWithFullStop(sentence: string): string {
  const trimmed = sentence.trimEnd();
  if (trimmed.length === 0 || SENTENCE_END_PUNCTUATION.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}.`;
}

export function parseSentencesFromJson(
  rawText: string,
  options: GenerationOptions,
  providerLabel: string,
): string[] {
  const sentenceCount = clampSentenceCount(options.sentenceCount);

  let parsed: GenerateResponse;
  try {
    parsed = JSON.parse(rawText) as GenerateResponse;
  } catch {
    throw new Error(`Could not parse sentences from ${providerLabel}`);
  }

  if (!Array.isArray(parsed.sentences)) {
    throw new Error(`Invalid sentence format from ${providerLabel}`);
  }

  const sentences = parsed.sentences
    .filter((s): s is string => typeof s === "string")
    .map((s) => ensureSentenceEndsWithFullStop(s.trim()))
    .filter((s) => s.length > 0);

  if (sentences.length === 0) {
    throw new Error(`${providerLabel} returned no usable sentences`);
  }

  if (sentences.length < sentenceCount) {
    throw new Error(`Expected ${sentenceCount} sentences but got ${sentences.length}`);
  }

  return sentences.slice(0, sentenceCount);
}
