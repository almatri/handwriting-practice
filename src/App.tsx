import { useCallback, useLayoutEffect, useRef, useState } from "react";

const MIN_FONT = 12;
const MAX_FONT = 70;
const DEFAULT_FONT = 40;
const MIN_SENTENCE_SPACING = 0;
const MAX_SENTENCE_SPACING = 48;
const DEFAULT_SENTENCE_SPACING = 32;
const ARABIC_TEXT_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

type HandwritingFontKey =
  | "poppins"
  | "eduSaHand"
  | "notoNaskhArabic"
  | "kgPrimaryPenmanship"
  | "abeezee"
  | "patrickHand"
  | "kalam";

const HANDWRITING_FONTS: Record<HandwritingFontKey, { label: string; family: string }> = {
  poppins: {
    label: "Poppins",
    family: "'Poppins', sans-serif",
  },
  eduSaHand: {
    label: "Edu SA Hand",
    family: "'Edu SA Beginner', 'Patrick Hand', cursive, sans-serif",
  },
  notoNaskhArabic: {
    label: "Noto Naskh Arabic",
    family: "'Noto Naskh Arabic', serif",
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

function WorksheetLine({
  line,
  fontPx,
  fontFamily,
  hideMidline = false,
  grayTopLine = false,
}: {
  line: string;
  fontPx: number;
  fontFamily: string;
  hideMidline?: boolean;
  grayTopLine?: boolean;
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
          <div
            className="absolute top-0 left-0 h-[1px] w-full"
            style={{ backgroundColor: grayTopLine ? "#55555515" : "#55555555" }}
          />
        )}
        {isPracticeRow && !hideMidline && (
          <div
            className="absolute w-full border-t border-dashed border-[#55555555]"
            style={{ top: midlineTop }}
          />
        )}
        {isPracticeRow && <div className="absolute bottom-0 left-0 h-[1px] w-full bg-[#55555555]" />}
      </div>
      <p
        className="absolute inset-x-0 bottom-0 px-1.5 text-[#0f172a] leading-none whitespace-nowrap"
        dir={rtl ? "rtl" : "ltr"}
        style={{
          paddingBottom: textBottomPadding,
          textAlign: rtl ? "right" : "left",
        }}
      >
        {line}
      </p>
    </div>
  );
}

export default function App() {
  const [studentNameOption, setStudentNameOption] = useState<"almaha" | "alanoud" | "custom">("almaha");
  const [customStudentName, setCustomStudentName] = useState("");
  const [practiceLines, setPracticeLines] = useState<string[]>([""]);
  const [handwritingFont, setHandwritingFont] = useState<HandwritingFontKey>("poppins");
  const [sentenceSpacingPx, setSentenceSpacingPx] = useState(DEFAULT_SENTENCE_SPACING);
  const lineInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingLineFocus = useRef<number | null>(null);
  const studentName =
    studentNameOption === "almaha"
      ? "Almaha"
      : studentNameOption === "alanoud"
        ? "Alanoud"
        : customStudentName;

  useLayoutEffect(() => {
    if (pendingLineFocus.current === null) return;
    const i = pendingLineFocus.current;
    pendingLineFocus.current = null;
    const el = lineInputRefs.current[i];
    el?.focus();
  }, [practiceLines]);

  const [fontPx, setFontPx] = useState(DEFAULT_FONT);

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
              <label htmlFor="student-custom" className="mb-1.5 block text-sm font-medium text-slate-700">
                Student name
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStudentNameOption("almaha")}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sky-400 ${
                    studentNameOption === "almaha"
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Almaha
                </button>
                <button
                  type="button"
                  onClick={() => setStudentNameOption("alanoud")}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sky-400 ${
                    studentNameOption === "alanoud"
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Alanoud
                </button>
                <input
                  id="student-custom"
                  type="text"
                  value={customStudentName}
                  onFocus={() => setStudentNameOption("custom")}
                  onChange={(e) => {
                    setStudentNameOption("custom");
                    setCustomStudentName(e.target.value);
                  }}
                  dir={isRtlText(customStudentName) ? "rtl" : "ltr"}
                  className={`min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-slate-900 shadow-inner outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                    studentNameOption === "custom" ? "border-sky-500" : "border-slate-300"
                  } ${isRtlText(customStudentName) ? "text-right" : "text-left"}`}
                  placeholder="Custom name"
                  autoComplete="name"
                />
              </div>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-slate-700">Practice sentences</legend>
              <p className="mb-2 text-xs text-slate-500">
                Press Enter to add another line. Use the button to remove a line. Each line with text gets a blank
                ruled row under it on the sheet for your child to practice.
              </p>
              <ul className="space-y-2" role="list">
                {practiceLines.map((line, index) => {
                  const rtl = isRtlText(line);
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
                {(
                  Object.entries(HANDWRITING_FONTS) as [
                    HandwritingFontKey,
                    (typeof HANDWRITING_FONTS)[HandwritingFontKey],
                  ][]
                ).map(([key, option]) => (
                  <option key={key} value={key}>
                    {option.label}
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
              <div className="box-border min-h-[277mm] w-full pt-[30px] pb-[30px] pl-[20px] pr-[20px] text-left print:min-h-[277mm] print:pt-[30px] print:pb-[30px] print:pl-[10px] print:pr-[10px]">
                <div className="mb-12 border-b border-slate-200 pb-5 text-center print:mb-8 print:mb-12">
                  <h2
                    className="text-2xl font-semibold text-slate-800"
                    style={{ fontFamily: "Lexend, system-ui, sans-serif" }}
                  >
                    {studentName.trim() || "Practice sheet"}
                  </h2>
                  <p
                    className="mt-1 text-sm text-slate-500"
                    style={{ fontFamily: "Lexend, system-ui, sans-serif" }}
                  >
                    Handwriting practice
                  </p>
                </div>

                <div className="flex w-full flex-col" style={{ rowGap: sentenceSpacingPx }}>
                  {practiceLines.map((line, i) => {
                    const hasSentence = line.trim() !== "";
                    const isArabicSentence = isRtlText(line);
                    return (
                      <div key={i} className="w-full break-inside-avoid space-y-5">
                        <WorksheetLine
                          line={hasSentence ? `${i + 1}. ${line}` : line}
                          fontPx={fontPx}
                          fontFamily={HANDWRITING_FONTS[handwritingFont].family}
                        />
                        {hasSentence && (
                          <WorksheetLine
                            line=""
                            fontPx={fontPx}
                            fontFamily={HANDWRITING_FONTS[handwritingFont].family}
                            hideMidline={isArabicSentence}
                            grayTopLine={isArabicSentence}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
