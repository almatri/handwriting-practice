import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  AI_PROVIDERS,
  DEFAULT_SENTENCE_COUNT,
  MAX_SENTENCE_COUNT,
  apiKeyEnvHint,
  fetchOpenRouterFreeModels,
  freeModelsForProvider,
  generatePracticeSentences,
  getApiKey,
  getStoredModel,
  hasEnvApiKey,
  parseTopicsInput,
  setApiKey,
  setStoredModel,
  type AiProvider,
  type FreeModelOption,
  type GenerationGrade,
} from "./ai";

const MIN_FONT = 12;
const MAX_FONT = 70;
const DEFAULT_FONT = 22;
const MIN_SENTENCE_SPACING = 0;
const MAX_SENTENCE_SPACING = 100;
const DEFAULT_SENTENCE_SPACING = 32;
const ARABIC_TEXT_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

type HandwritingFontKey =
  | "poppins"
  | "eduSaHand"
  | "systemArabic"
  | "notoNaskhArabic"
  | "arabicEducational"
  | "amiri"
  | "arabicRuqaa"
  | "arabicPlayful"
  | "kgPrimaryPenmanship"
  | "abeezee"
  | "patrickHand"
  | "kalam";
type PracticeLineStyle = "guided" | "single";
type WorksheetLanguage = "english" | "arabic";
type WorksheetMode = "multiple" | "single";

const ENGLISH_FONT_KEYS: HandwritingFontKey[] = [
  "poppins",
  "eduSaHand",
  "kgPrimaryPenmanship",
  "abeezee",
  "patrickHand",
  "kalam",
];
const ARABIC_FONT_KEYS: HandwritingFontKey[] = [
  "arabicEducational",
  "amiri",
  "arabicRuqaa",
  "arabicPlayful",
  "notoNaskhArabic",
  "systemArabic",
];

const HANDWRITING_FONTS: Record<HandwritingFontKey, { label: string; family: string }> = {
  poppins: {
    label: "Poppins",
    family: "'Poppins', sans-serif",
  },
  eduSaHand: {
    label: "Edu SA Hand",
    family: "'Edu SA Beginner', 'Patrick Hand', cursive, sans-serif",
  },
  systemArabic: {
    label: "System Arabic",
    family: "'Geeza Pro', 'Al Bayan', 'Baghdad', 'Tahoma', sans-serif",
  },
  notoNaskhArabic: {
    label: "Noto Naskh Arabic",
    family: "'Noto Naskh Arabic', 'Geeza Pro', 'Tahoma', serif",
  },
  arabicEducational: {
    label: "نسخ تعليمي — Simplified / Droid Naskh",
    family:
      "'Simplified Arabic', 'Droid Arabic Naskh', 'Noto Naskh Arabic', 'Geeza Pro', 'Tahoma', serif",
  },
  amiri: {
    label: "الأميري — Amiri",
    family: "'Amiri', 'Traditional Arabic', 'Geeza Pro', 'Times New Roman', serif",
  },
  arabicRuqaa: {
    label: "رقعة — Traditional Arabic",
    family: "'Traditional Arabic', 'Aref Ruqaa', 'Segoe UI', 'Tahoma', sans-serif",
  },
  arabicPlayful: {
    label: "أطفال وقصص — Lalezar / Rakkas",
    family: "'Lalezar', 'Rakkas', 'Comic Sans MS', 'Tahoma', cursive, sans-serif",
  },
  kgPrimaryPenmanship: {
    label: "KG Primary Penmanship",
    family: "'KG Primary Penmanship', 'KG Primary', 'Patrick Hand', cursive, sans-serif",
  },
  abeezee: {
    label: "ABeeZee (print)",
    family: "'ABeeZee', 'Comic Neue', sans-serif, system-ui",
  },
  patrickHand: {
    label: "Patrick Hand (school)",
    family: "'Patrick Hand', 'Comic Neue', cursive, system-ui",
  },
  kalam: {
    label: "Kalam (rounded)",
    family: "'Kalam', 'Comic Neue', cursive, system-ui",
  },
};

function isRtlText(value: string): boolean {
  return ARABIC_TEXT_REGEX.test(value);
}

/** Render **bold** segments in worksheet text (markers are hidden on the sheet). */
function renderLineWithBold(text: string): ReactNode {
  if (!text.includes("**")) return text;
  const parts = text.split("**");
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ fontWeight: 700 }}>
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function WorksheetLine({
  line,
  fontPx,
  fontFamily,
  hideMidline = false,
  grayTopLine = false,
  lineStyle = "guided",
}: {
  line: string;
  fontPx: number;
  fontFamily: string;
  hideMidline?: boolean;
  grayTopLine?: boolean;
  lineStyle?: PracticeLineStyle;
}) {
  // Tune row metrics so uppercase and lowercase letterforms align better
  // with the guide lines on "primary paper".
  const rowHeight = fontPx;
  const midlineTop = "50%";
  const textBottomPadding = 0;
  const isPracticeRow = line.trim() === "";
  const rtl = isRtlText(line);
  return (
    <div
      className="relative w-full break-inside-avoid"
      style={{
        minHeight: rowHeight,
        fontSize: fontPx,
        fontFamily,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        {isPracticeRow && (
          lineStyle === "single" ? (
            <div className="absolute left-0 h-[1px] w-full bg-[#55555555]" style={{ top: "70%" }} />
          ) : (
            <div
              className="absolute top-0 left-0 h-[1px] w-full"
              style={{ backgroundColor: grayTopLine ? "#55555515" : "#55555555" }}
            />
          )
        )}
        {isPracticeRow && lineStyle === "guided" && !hideMidline && (
          <div
            className="absolute w-full border-t border-dashed border-[#55555555]"
            style={{ top: midlineTop }}
          />
        )}
        {isPracticeRow && lineStyle === "guided" && (
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-[#55555555]" />
        )}
      </div>
      <p
        className="absolute inset-x-0 bottom-0 px-1.5 text-[#0f172a] leading-none whitespace-nowrap"
        dir={rtl ? "rtl" : "ltr"}
        style={{
          paddingBottom: textBottomPadding,
          textAlign: rtl ? "right" : "left",
        }}
      >
        {renderLineWithBold(line)}
      </p>
    </div>
  );
}

export default function App() {
  const [worksheetMode, setWorksheetMode] = useState<WorksheetMode>("multiple");
  const [practiceLines, setPracticeLines] = useState<string[]>([""]);
  const [singleSentence, setSingleSentence] = useState("");
  const [singlePracticeLineCount, setSinglePracticeLineCount] = useState(3);
  const [handwritingFont, setHandwritingFont] = useState<HandwritingFontKey>("poppins");
  const [worksheetLanguage, setWorksheetLanguage] = useState<WorksheetLanguage>("english");
  const [sentenceSpacingPx, setSentenceSpacingPx] = useState(DEFAULT_SENTENCE_SPACING);
  const [aiProvider, setAiProvider] = useState<AiProvider>("gemini");
  const [aiApiKey, setAiApiKey] = useState(() => getApiKey("gemini"));
  const [openRouterFreeModels, setOpenRouterFreeModels] = useState<FreeModelOption[]>(() =>
    freeModelsForProvider("openrouter"),
  );
  const [modelByProvider, setModelByProvider] = useState<Record<AiProvider, string>>(() => ({
    gemini: getStoredModel("gemini", freeModelsForProvider("gemini")),
    openrouter: getStoredModel("openrouter", freeModelsForProvider("openrouter")),
  }));
  const [generatingSentences, setGeneratingSentences] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [genGrade, setGenGrade] = useState<GenerationGrade>(2);
  const [genTopicsText, setGenTopicsText] = useState("");
  const [genBoldTarget, setGenBoldTarget] = useState("");
  const [genSentenceCount, setGenSentenceCount] = useState(DEFAULT_SENTENCE_COUNT);
  const activeProviderMeta = AI_PROVIDERS.find((p) => p.id === aiProvider)!;
  const hasEnvKeyForProvider = hasEnvApiKey(aiProvider);
  const modelsForProvider = (provider: AiProvider): FreeModelOption[] =>
    provider === "gemini" ? freeModelsForProvider("gemini") : openRouterFreeModels;
  const activeModel = modelByProvider[aiProvider];

  useEffect(() => {
    let cancelled = false;
    fetchOpenRouterFreeModels().then((models) => {
      if (cancelled) return;
      setOpenRouterFreeModels(models);
      setModelByProvider((prev) => ({
        ...prev,
        openrouter: getStoredModel("openrouter", models),
      }));
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const lineInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingLineFocus = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingLineFocus.current === null) return;
    const i = pendingLineFocus.current;
    pendingLineFocus.current = null;
    const el = lineInputRefs.current[i];
    el?.focus();
  }, [practiceLines]);

  const [fontPx, setFontPx] = useState(DEFAULT_FONT);
  const isArabicMode = worksheetLanguage === "arabic";
  const allowedFontKeys = worksheetLanguage === "arabic" ? ARABIC_FONT_KEYS : ENGLISH_FONT_KEYS;
  const effectiveLineStyle: PracticeLineStyle = worksheetLanguage === "arabic" ? "single" : "guided";
  const previewRows =
    worksheetMode === "single"
      ? [{ sentence: singleSentence, practiceCount: Math.max(0, singlePracticeLineCount) }]
      : practiceLines.map((sentence) => ({
          sentence,
          practiceCount: sentence.trim() === "" ? 0 : 1,
        }));

  const printWorksheet = useCallback(() => {
    window.print();
  }, []);

  const updateLine = useCallback((index: number, value: string) => {
    setPracticeLines((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const insertLineAfter = useCallback((index: number) => {
    pendingLineFocus.current = index + 1;
    setPracticeLines((prev) => [...prev.slice(0, index + 1), "", ...prev.slice(index + 1)]);
  }, []);

  const removeLine = useCallback(
    (index: number) => {
      if (practiceLines.length === 1) {
        pendingLineFocus.current = 0;
        setPracticeLines([""]);
        return;
      }
      const next = practiceLines.filter((_, j) => j !== index);
      pendingLineFocus.current = Math.min(index, next.length - 1);
      setPracticeLines(next);
    },
    [practiceLines]
  );

  const pasteLinesAt = useCallback(
    (index: number, pastedText: string) => {
      const lines = pastedText
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      if (lines.length <= 1) return false;

      setPracticeLines((prev) => {
        const before = prev.slice(0, index);
        const after = prev.slice(index + 1);
        return [...before, ...lines, ...after];
      });
      pendingLineFocus.current = index + lines.length - 1;
      return true;
    },
    []
  );

  const selectAiProvider = useCallback(
    (next: AiProvider) => {
      if (next === aiProvider) return;
      setApiKey(aiProvider, aiApiKey);
      setAiProvider(next);
      setAiApiKey(getApiKey(next));
      setGenerateError(null);
    },
    [aiProvider, aiApiKey],
  );

  const selectModel = useCallback((provider: AiProvider, modelId: string) => {
    setModelByProvider((prev) => ({ ...prev, [provider]: modelId }));
    setStoredModel(provider, modelId);
    setGenerateError(null);
  }, []);

  const handleGenerateSentences = useCallback(async () => {
    const key = aiApiKey.trim();
    if (!key) {
      setGenerateError(apiKeyEnvHint(aiProvider));
      return;
    }

    setGeneratingSentences(true);
    setGenerateError(null);
    try {
      const topics = parseTopicsInput(genTopicsText);
      const requestedSentenceCount = worksheetMode === "single" ? 1 : genSentenceCount;
      const sentences = await generatePracticeSentences(aiProvider, key, {
        language: worksheetLanguage,
        grade: genGrade,
        sentenceCount: requestedSentenceCount,
        model: activeModel,
        topics: topics.length > 0 ? topics : undefined,
        boldTarget: genBoldTarget.trim() || undefined,
      });
      if (worksheetMode === "single") {
        setSingleSentence(sentences[0] ?? "");
      } else {
        pendingLineFocus.current = null;
        setPracticeLines(sentences);
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate sentences");
    } finally {
      setGeneratingSentences(false);
    }
  }, [activeModel, aiApiKey, aiProvider, worksheetLanguage, genBoldTarget, genGrade, genTopicsText, genSentenceCount, worksheetMode]);

  return (
    <div className="min-h-dvh bg-slate-200 text-slate-900 print:bg-white">
      <div className="mx-auto max-w-5xl p-4 pb-12 print:p-0 print:max-w-none">
        <header className="no-print mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
            Handwriting practice worksheet
          </h1>
          <p className="mt-1 text-slate-600">
            Add your child&apos;s name and practice sentences. The preview updates as you type. Use
            print or &quot;Save as PDF&quot; in the system dialog to keep a copy.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-start">
          <div className="no-print space-y-4">
          <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div>
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-slate-700">
                  Worksheet language
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWorksheetLanguage("english");
                      setHandwritingFont((prev) => (ENGLISH_FONT_KEYS.includes(prev) ? prev : "poppins"));
                    }}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sky-400 ${
                      worksheetLanguage === "english"
                        ? "border-sky-600 bg-sky-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWorksheetLanguage("arabic");
                      setHandwritingFont("arabicEducational");
                    }}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sky-400 ${
                      worksheetLanguage === "arabic"
                        ? "border-sky-600 bg-sky-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Arabic
                  </button>
                </div>
              </fieldset>
            </div>

            <div>
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-slate-700">Worksheet mode</legend>
                <p className="mb-2 text-xs text-slate-500">
                  To practice a single sentence, select "Single". To practice multiple sentences, select "Multiple".
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorksheetMode("single")}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sky-400 ${
                      worksheetMode === "single"
                        ? "border-sky-600 bg-sky-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Single
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorksheetMode("multiple")}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sky-400 ${
                      worksheetMode === "multiple"
                        ? "border-sky-600 bg-sky-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Multiple
                  </button>
                </div>
              </fieldset>
            </div>

            <div className="space-y-3 rounded-lg border border-violet-100 bg-violet-50/40 p-3">
              <fieldset>
                <legend className="mb-1.5 text-xs font-medium text-slate-700">AI provider</legend>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="AI provider">
                  {AI_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => selectAiProvider(provider.id)}
                      className={`rounded-lg border px-2 py-1.5 text-sm font-medium transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-violet-400 ${
                        aiProvider === provider.id
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {provider.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor={`ai-model-${aiProvider}`}
                  className="mb-1 block text-xs font-medium text-slate-700"
                >
                  {activeProviderMeta.label} model{" "}
                  <span className="font-normal text-slate-500">(free)</span>
                </label>
                <select
                  id={`ai-model-${aiProvider}`}
                  value={modelByProvider[aiProvider]}
                  onChange={(e) => selectModel(aiProvider, e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                >
                  {modelsForProvider(aiProvider).map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset>
                <legend className="mb-1.5 text-xs font-medium text-slate-700">Grade</legend>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="Grade level">
                  {([1, 2, 3] as const).map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setGenGrade(grade)}
                      className={`rounded-lg border px-2 py-1.5 text-sm font-medium transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-violet-400 ${
                        genGrade === grade
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="gen-topics" className="mb-1 block text-xs font-medium text-slate-700">
                  Topics <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <textarea
                  id="gen-topics"
                  value={genTopicsText}
                  onChange={(e) => {
                    setGenTopicsText(e.target.value);
                    setGenerateError(null);
                  }}
                  placeholder={
                    isArabicMode
                      ? "مثال:\nالشتاء\nالحيوانات"
                      : "e.g.\nwinter\nfarm animals"
                  }
                  rows={4}
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {isArabicMode
                    ? "ضع كل موضوع في سطر، أو افصلها بفواصل. اترك الحقل فارغًا لموضوع عشوائي."
                    : "Enter one topic per line, or separate them with commas. Leave it empty for a surprise theme."}
                </p>
              </div>

              <div>
                <label htmlFor="gen-bold-target" className="mb-1 block text-xs font-medium text-slate-700">
                  What to bold <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="gen-bold-target"
                  type="text"
                  value={genBoldTarget}
                  onChange={(e) => {
                    setGenBoldTarget(e.target.value);
                    setGenerateError(null);
                  }}
                  placeholder={
                    isArabicMode
                      ? "مثل: كلمات بصرية، كلمات فيها حرف س"
                      : "e.g. sight words, words with the letter sh"
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {isArabicMode
                    ? "إذا تركته فارغًا، فلن يتم تغليظ أي كلمة."
                    : "If left empty, nothing will be bold."}
                </p>
              </div>

              {worksheetMode === "multiple" && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="gen-sentence-count" className="text-xs font-medium text-slate-700">
                      Number of sentences
                    </label>
                    <span className="text-xs tabular-nums text-slate-500">{genSentenceCount}</span>
                  </div>
                  <input
                    id="gen-sentence-count"
                    type="range"
                    min={1}
                    max={MAX_SENTENCE_COUNT}
                    value={genSentenceCount}
                    onChange={(e) => setGenSentenceCount(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-violet-600"
                  />
                  {genSentenceCount > 7 && (
                    <p className="mt-1 text-xs text-amber-700">
                      {isArabicMode
                        ? "قد يبدو الورقة مزدحمًا عند الطباعة."
                        : "The worksheet may feel crowded when printing."}
                    </p>
                  )}
                </div>
              )}

              {!hasEnvKeyForProvider && (
                <div>
                  <label htmlFor="ai-api-key" className="mb-1 block text-xs font-medium text-slate-600">
                    {activeProviderMeta.label} API key
                  </label>
                  <input
                    id="ai-api-key"
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => {
                      setAiApiKey(e.target.value);
                      setGenerateError(null);
                    }}
                    onBlur={() => setApiKey(aiProvider, aiApiKey)}
                    placeholder={activeProviderMeta.keyPlaceholder}
                    autoComplete="off"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleGenerateSentences}
                  disabled={generatingSentences || !aiApiKey.trim()}
                  className="inline-flex w-full min-h-10 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-800 transition hover:border-violet-300 hover:bg-violet-100 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generatingSentences
                    ? "Generating…"
                    : `Generate ${worksheetMode === "single" ? "1 sentence" : `${genSentenceCount} sentence${genSentenceCount === 1 ? "" : "s"}`} with ${activeProviderMeta.label}`}
                </button>
                {generateError && (
                  <p className="text-xs text-rose-600" role="alert">
                    {generateError}
                  </p>
                )}
              </div>
            </div>

            {worksheetMode === "multiple" ? (
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-slate-700">
                  Practice sentences
                </legend>
                <p className="mb-2 text-xs text-slate-500">
                  Press Enter to add another line.{" "}
                  {isArabicMode
                    ? "لتغليظ كلمة: ضعها بين **نجمتين**، مثل: أنا **أحب** المدرسة."
                    : "Bold a word: wrap it in **double asterisks**, e.g. I **love** school."}
                </p>

                <ul className="space-y-2" role="list">
                  {practiceLines.map((line, index) => {
                    const rtl = worksheetLanguage === "arabic" || isRtlText(line);
                    return (
                    <li key={index} className="flex items-center gap-1.5">
                      <input
                        ref={(el) => {
                          lineInputRefs.current[index] = el;
                        }}
                        type="text"
                        value={line}
                        dir={rtl ? "rtl" : "ltr"}
                        onChange={(e) => updateLine(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            insertLineAfter(index);
                          }
                        }}
                        onPaste={(e) => {
                          const pastedText = e.clipboardData.getData("text");
                          if (pasteLinesAt(index, pastedText)) {
                            e.preventDefault();
                          }
                        }}
                        className={`min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                          rtl ? "text-right" : "text-left"
                        }`}
                        placeholder="One row on the worksheet"
                        spellCheck
                        id={`practice-sentence-${index}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-rose-400"
                        title="Remove line"
                        aria-label="Remove this line"
                      >
                        <span className="text-lg font-light leading-none" aria-hidden>
                          ×
                        </span>
                      </button>
                    </li>
                  )})}
                </ul>
              </fieldset>
            ) : (
              <fieldset className="space-y-3">
                <legend className="mb-1.5 text-sm font-medium text-slate-700">Practice sentence</legend>
                <p className="mb-2 text-xs text-slate-500">
                  {isArabicMode
                    ? "لتغليظ كلمة: ضعها بين **نجمتين**، مثل: أنا **أحب** المدرسة."
                    : "Bold a word: wrap it in **double asterisks**, e.g. I **love** school."}
                </p>
                <input
                  type="text"
                  value={singleSentence}
                  dir={isArabicMode || isRtlText(singleSentence) ? "rtl" : "ltr"}
                  onChange={(e) => setSingleSentence(e.target.value)}
                  className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                    isArabicMode || isRtlText(singleSentence) ? "text-right" : "text-left"
                  }`}
                  placeholder="Type one sentence"
                  spellCheck
                />

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="single-practice-lines" className="text-sm font-medium text-slate-700">
                      Number of practice lines
                    </label>
                    <span className="text-sm tabular-nums text-slate-500">{singlePracticeLineCount}</span>
                  </div>
                  <input
                    id="single-practice-lines"
                    type="range"
                    min={1}
                    max={10}
                    value={singlePracticeLineCount}
                    onChange={(e) => setSinglePracticeLineCount(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-600"
                  />
                </div>
              </fieldset>
            )}

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="handwriting-font" className="text-sm font-medium text-slate-700">
                  Handwriting font
                </label>
              </div>
              <select
                id="handwriting-font"
                value={handwritingFont}
                onChange={(e) => setHandwritingFont(e.target.value as HandwritingFontKey)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              >
                {allowedFontKeys.map((key) => (
                  <option key={key} value={key}>
                    {HANDWRITING_FONTS[key].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="font" className="text-sm font-medium text-slate-700">
                  Font size
                </label>
                <span className="text-sm tabular-nums text-slate-500">{fontPx}px</span>
              </div>
              <input
                id="font"
                type="range"
                min={MIN_FONT}
                max={MAX_FONT}
                value={fontPx}
                onChange={(e) => setFontPx(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-600"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>Smaller (younger)</span>
                <span>Larger (older)</span>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="sentence-spacing" className="text-sm font-medium text-slate-700">
                  Sentence spacing
                </label>
                <span className="text-sm tabular-nums text-slate-500">{sentenceSpacingPx}px</span>
              </div>
              <input
                id="sentence-spacing"
                type="range"
                min={MIN_SENTENCE_SPACING}
                max={MAX_SENTENCE_SPACING}
                value={sentenceSpacingPx}
                onChange={(e) => setSentenceSpacingPx(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-600"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>Less gap</span>
                <span>More gap</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={printWorksheet}
                className="inline-flex min-h-11 min-w-[9rem] items-center justify-center rounded-lg bg-sky-600 px-4 font-medium text-white shadow transition hover:bg-sky-700 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sky-600"
              >
                Print / Save as PDF
              </button>
            </div>
          </section>
          <p className="text-sm text-slate-500">
            Tip: In the print dialog, choose <strong className="font-medium text-slate-600">Save as PDF</strong> to
            download without paper.
          </p>
          </div>

          <div>
            <p className="no-print mb-2 text-sm font-medium text-slate-600">Live preview</p>
            <div
              id="worksheet"
              className="mx-auto w-[190mm] max-w-full min-h-[277mm] rounded-lg border border-slate-200 bg-white shadow-md print:w-[190mm] print:min-h-[277mm] print:rounded-none print:border-0 print:shadow-none"
            >
              <div
                className="box-border flex min-h-[277mm] w-full flex-col pt-[30px] pb-[30px] pl-[20px] pr-[20px] text-left print:min-h-[277mm] print:pt-[30px] print:pb-[30px] print:pl-[10px] print:pr-[10px]"
                dir={isArabicMode ? "rtl" : "ltr"}
              >
                <div className="mb-8 border-b border-dotted border-emerald-200 pb-4 print:mb-8">
                  <div className="mb-1.5 flex items-start justify-between gap-3">
                    <div className="h-10 w-10 shrink-0" aria-hidden>
                      <svg viewBox="0 0 48 48" className="h-full w-full">
                        <defs>
                          <radialGradient id="sunGradient" cx="35%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#fde68a" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </radialGradient>
                        </defs>
                        <g stroke="#fbbf24" strokeLinecap="round" strokeWidth="3">
                          <line x1="24" y1="3" x2="24" y2="8" />
                          <line x1="24" y1="40" x2="24" y2="45" />
                          <line x1="3" y1="24" x2="8" y2="24" />
                          <line x1="40" y1="24" x2="45" y2="24" />
                          <line x1="9" y1="9" x2="13" y2="13" />
                          <line x1="35" y1="35" x2="39" y2="39" />
                          <line x1="39" y1="9" x2="35" y2="13" />
                          <line x1="13" y1="35" x2="9" y2="39" />
                        </g>
                        <circle cx="24" cy="24" r="14" fill="url(#sunGradient)" />
                        <circle cx="19" cy="21" r="2" fill="#92400e" />
                        <circle cx="29" cy="21" r="2" fill="#92400e" />
                        <path d="M18 28c2 3 10 3 12 0" fill="none" stroke="#92400e" strokeLinecap="round" strokeWidth="2" />
                        <circle cx="15" cy="26" r="2.5" fill="#fca5a5" opacity="0.45" />
                        <circle cx="33" cy="26" r="2.5" fill="#fca5a5" opacity="0.45" />
                      </svg>
                    </div>
                    <div className="flex flex-1 justify-around pt-1" aria-hidden>
                      {[0, 1, 2].map((cloud) => (
                        <svg
                          key={cloud}
                          viewBox="0 0 64 32"
                          className={`${cloud === 1 ? "mt-2 h-4 w-9" : "h-5 w-11"}`}
                        >
                          <defs>
                            <linearGradient id={`cloudGradient-${cloud}`} x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#e0f2fe" />
                              <stop offset="100%" stopColor="#bae6fd" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M17 25h32c6 0 10-3.8 10-8.6 0-4.4-3.5-8-8-8-1.4 0-2.8.4-4 1.1C44.8 5 40.1 2 34.8 2c-6 0-11 3.8-12.8 9.1A9.4 9.4 0 0 0 17 9.7c-5.8 0-10.5 4.1-10.5 9.2S11.2 25 17 25Z"
                            fill={`url(#cloudGradient-${cloud})`}
                          />
                          <path
                            d="M16 25h34c3.5 0 6.5-1.4 8-3.7-2 1-4.5 1.6-7.4 1.6H17c-5.2 0-9-2.2-10.2-5.5-.2.6-.3 1.2-.3 1.8C6.5 23.3 10.7 25 16 25Z"
                            fill="#93c5fd"
                            opacity="0.18"
                          />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <div className="mb-2 flex items-center justify-between gap-4 text-xs text-slate-700" dir="ltr">
                    {isArabicMode ? (
                      <>
                        <p className="shrink-0 text-left" dir="rtl">
                          التاريخ:<span className="font-medium text-sky-700"> . . . . . . . . . . . . . . . . </span>
                        </p>
                        <p className="min-w-0 flex-1 truncate text-right" dir="rtl">
                          الاسم:<span className="font-medium text-sky-700"> . . . . . . . . . . . . . . . . </span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="min-w-0 flex-1 truncate">
                          Name: <span className="font-medium text-sky-700">__________</span>
                        </p>
                        <p className="shrink-0">Date: ______</p>
                      </>
                    )}
                  </div>

                  <div className="text-center">
                    <h2
                      className="text-xl font-bold tracking-tight"
                      style={{ fontFamily: "Lexend, system-ui, sans-serif" }}
                    >
                      <span className="mr-1 text-amber-400">★</span>
                      <span className="text-sky-500">{isArabicMode ? "تدريب" : "Hand"}</span>
                      <span className="text-emerald-500">{isArabicMode ? " على" : "writing"}</span>
                      <span> </span>
                      <span className="text-pink-500">{isArabicMode ? "الخط" : "Practice"}</span>
                      <span className="ml-1 text-amber-400">★</span>
                    </h2>
                    <p className="mt-1 inline-block rounded-full bg-emerald-100/80 px-4 py-1 text-[11px] text-emerald-800">
                      {isArabicMode
                        ? "اقرأ كل جملة واكتبها بخط جميل على السطور."
                        : "Read each sentence and write it neatly on the lines."}
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex w-full flex-col" style={{ rowGap: sentenceSpacingPx }}>
                  {previewRows.map((row, i) => {
                    const line = row.sentence;
                    const hasSentence = line.trim() !== "";
                    const isArabicSentence = isRtlText(line);
                    return (
                      <div
                        key={i}
                        className="w-full break-inside-avoid"
                        style={{ display: "flex", flexDirection: "column", rowGap: worksheetMode === "single" ? sentenceSpacingPx : 24 }}
                      >
                        <WorksheetLine
                          line={
                            hasSentence
                              ? worksheetMode === "multiple"
                                ? `${isArabicMode ? (i + 1).toLocaleString("ar-EG") : i + 1}. ${line}`
                                : line
                              : line
                          }
                          fontPx={fontPx}
                          fontFamily={HANDWRITING_FONTS[handwritingFont].family}
                          lineStyle={effectiveLineStyle}
                        />
                        {hasSentence &&
                          Array.from({ length: row.practiceCount }).map((_, practiceIdx) => (
                            <WorksheetLine
                              key={`${i}-practice-${practiceIdx}`}
                              line=""
                              fontPx={fontPx}
                              fontFamily={HANDWRITING_FONTS[handwritingFont].family}
                              hideMidline={isArabicSentence}
                              grayTopLine={isArabicSentence}
                              lineStyle={effectiveLineStyle}
                            />
                          ))}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto flex items-end justify-between border-t border-dotted border-emerald-200 pt-3 text-[11px] text-slate-600">
                  <div className="flex items-end gap-2">
                    <span className="text-sm text-amber-400" aria-hidden>★</span>
                    <div>
                      <p className="font-medium text-emerald-700">
                        {isArabicMode ? "أنت تبلي بلاءً رائعًا!" : "You're doing amazing!"}
                      </p>
                      <p className="text-slate-500">
                        {isArabicMode ? "استمر في التدريب!" : "Keep practicing!"}{" "}
                        <span className="text-pink-400" aria-hidden>♥</span>
                      </p>
                    </div>
                  </div>
                  <div className="hidden text-center text-[9px] text-emerald-300 sm:block" aria-hidden>
                    • ✿ • ✿ •
                  </div>
                  <div className="text-right">
                    <p className="mb-0.5 font-medium text-slate-600">
                      {isArabicMode ? "تقييم ولي الأمر" : "Parent Stars"}
                    </p>
                    <div className="flex gap-0.5 text-sm text-amber-400" aria-label="Five empty rating stars">
                      <span>☆</span>
                      <span>☆</span>
                      <span>☆</span>
                      <span>☆</span>
                      <span>☆</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
