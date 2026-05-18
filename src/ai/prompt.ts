import type { GenerationGrade, GenerationOptions } from "./types";
import { MAX_SENTENCE_COUNT, MIN_SENTENCE_COUNT } from "./types";

const SURPRISE_THEMES = [
  "a rainy day at the park",
  "making breakfast with family",
  "a trip to the library",
  "playing board games indoors",
  "planting seeds in the garden",
  "a snowy afternoon",
  "riding bikes on a quiet street",
  "visiting a grandparents house",
  "building with blocks",
  "a sunny day at the beach",
  "learning to swim",
  "packing for a camping trip",
  "a music lesson",
  "helping in the kitchen",
  "stargazing at night",
  "a school science fair",
  "feeding birds in the yard",
  "a puppet show at home",
];

const SENTENCE_CATEGORIES = [
  "something you can see",
  "something you can do",
  "a feeling",
  "a place",
  "a simple question",
  "something you hear",
  "something you like",
  "a time of day",
  "something at school",
  "something in nature",
];

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function pickUniqueCategories(count: number): string[] {
  const pool = [...SENTENCE_CATEGORIES];
  const picked: string[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]!);
  }
  while (picked.length < count) {
    picked.push(pickRandom(SENTENCE_CATEGORIES));
  }
  return picked;
}

export function clampSentenceCount(count: number): number {
  return Math.min(MAX_SENTENCE_COUNT, Math.max(MIN_SENTENCE_COUNT, Math.round(count)));
}

function gradeRules(grade: GenerationGrade): string {
  switch (grade) {
    case 1:
      return "Grade 1: 4–7 words per sentence. Use very simple sight words and one clear idea per sentence.";
    case 2:
      return "Grade 2: 6–9 words per sentence. Simple vocabulary; you may use and or but once.";
    case 3:
      return "Grade 3: 8–11 words per sentence. Still concrete and simple; no idioms or figurative language.";
  }
}

export function parseTopicsInput(text: string): string[] {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function buildPrompt(options: GenerationOptions): string {
  const count = clampSentenceCount(options.sentenceCount);
  const categories = pickUniqueCategories(count);
  const categoryList = categories.map((c, i) => `${i + 1}. ${c}`).join("\n");

  const languageInstruction =
    options.language === "arabic"
      ? "Write all sentences in Modern Standard Arabic suitable for children ages 6–9."
      : "Write all sentences in English.";

  const topics = options.topics?.filter((t) => t.length > 0) ?? [];
  const themeInstruction =
    topics.length > 0
      ? `Topics for this worksheet: ${topics.join(", ")}. Every sentence must relate to these topics. If there are multiple topics, spread them across sentences.`
      : `Theme for this worksheet: "${pickRandom(SURPRISE_THEMES)}". Build all sentences around this theme. Avoid overused clichés (happy puppy, yellow ball, zoo trip) unless they truly fit the theme.`;

  return `You write handwriting practice sentences for elementary school (grades 1–3).

${languageInstruction}

${gradeRules(options.grade)}

${themeInstruction}

Generate exactly ${count} short, cheerful, kid-safe sentences.

Each sentence must match one category (use each category once):
${categoryList}

Rules:
- Each sentence uses a different main subject (no repeated animals, colors, or settings).
- Bold exactly one important word with **double asterisks**.
- No quotation marks, semicolons, or dialogue.
- End each sentence with a period (.), except questions which end with ? (or ؟ in Arabic).
- Keep vocabulary appropriate for the target grade.

Return JSON only: {"sentences":["sentence 1", ...]}`;
}
