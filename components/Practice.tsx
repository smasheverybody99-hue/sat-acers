"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "./Icons";
import { Figure } from "./Figure";
import { RichText, renderMath } from "./MathText";
import { QUESTIONS, QUESTION_BY_ID, correctAnswerLabel, isCorrect } from "@/lib/questions";
import { loadProgress, recordAnswer } from "@/lib/progress";
import { DIFFICULTY_LABEL, SECTION_LABEL, type Difficulty, type Question, type Section } from "@/lib/types";

export type StatusFilter = "all" | "new" | "wrong";

export interface Filters {
  section: Section | "all";
  domain: string | "all";
  skill: string | "all";
  difficulty: Difficulty | "all";
  status: StatusFilter;
}

const DEFAULT_FILTERS: Filters = { section: "all", domain: "all", skill: "all", difficulty: "all", status: "all" };

function applyFilters(f: Filters): Question[] {
  const p = f.status === "all" ? null : loadProgress();
  return QUESTIONS.filter((q) => {
    if (f.section !== "all" && q.section !== f.section) return false;
    if (f.domain !== "all" && q.domain !== f.domain) return false;
    if (f.skill !== "all" && q.skill !== f.skill) return false;
    if (f.difficulty !== "all" && q.difficulty !== f.difficulty) return false;
    if (p && f.status === "new" && p.attempts[q.id]) return false;
    if (p && f.status === "wrong" && !(p.attempts[q.id] && !p.attempts[q.id].lastCorrect)) return false;
    return true;
  });
}

export function Practice({
  initial,
  ids,
  title,
  onFinish,
}: {
  initial?: Partial<Filters>;
  ids?: string[];
  title?: string;
  onFinish?: () => void;
}) {
  const fixedList = Boolean(ids);
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS, ...initial });
  const [queue, setQueue] = useState<Question[]>(() =>
    ids ? ids.map((id) => QUESTION_BY_ID[id]).filter(Boolean) : applyFilters({ ...DEFAULT_FILTERS, ...initial, status: "all" })
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [spr, setSpr] = useState("");
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [lang, setLang] = useState<"uz" | "en">("uz");
  const [session, setSession] = useState({ answered: 0, correct: 0 });
  const [results, setResults] = useState<boolean[]>([]);

  function resetAnswer() {
    setPicked(null);
    setSpr("");
    setChecked(false);
    setCorrect(false);
  }

  // Filtr o'zgarganda navbat qayta tuziladi
  useEffect(() => {
    if (fixedList) return;
    setQueue(applyFilters(filters));
    setIndex(0);
    resetAnswer();
    setSession({ answered: 0, correct: 0 });
    setResults([]);
  }, [filters, fixedList]);

  const q = queue[index];
  const finished = queue.length > 0 && index >= queue.length;
  const canCheck = q && !checked && (q.type === "mcq" ? picked !== null : spr.trim() !== "");

  const check = useCallback(() => {
    if (!q || checked) return;
    const response = q.type === "mcq" ? picked : spr;
    if (response === null || response === "") return;
    const ok = isCorrect(q, response);
    setCorrect(ok);
    setChecked(true);
    setSession((s) => ({ answered: s.answered + 1, correct: s.correct + (ok ? 1 : 0) }));
    setResults((r) => [...r, ok]);
    recordAnswer(q.id, ok);
  }, [q, checked, picked, spr]);

  const next = useCallback(() => {
    resetAnswer();
    setIndex((i) => i + 1);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!q) return;
      const typing = (e.target as HTMLElement).tagName === "INPUT";
      if (e.key === "Enter") {
        e.preventDefault();
        if (checked) next();
        else check();
        return;
      }
      if (!typing && !checked && q.type === "mcq") {
        const i = "abcd".indexOf(e.key.toLowerCase());
        if (i >= 0 && q.choices && i < q.choices.length) setPicked(i);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, checked, check, next]);

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  const crumbs = fixedList
    ? [title ?? "Mashq"]
    : [
        filters.section === "all" ? "Barcha bo'limlar" : SECTION_LABEL[filters.section],
        ...(filters.domain !== "all" ? [filters.domain] : []),
        ...(filters.skill !== "all" ? [filters.skill] : []),
        ...(filters.status === "wrong" && filters.section === "all" ? ["Xato qilinganlar"] : []),
      ];

  const progressPct = queue.length ? (Math.min(index + (checked ? 1 : 0), queue.length) / queue.length) * 100 : 0;

  return (
    <div className="session">
      <div className="session-top">
        <div className="session-title">
          {onFinish ? (
            <button className="back" onClick={onFinish}><Icon name="arrowLeft" size={18} /> Xatonoma</button>
          ) : (
            <a className="back" href="/practice"><Icon name="arrowLeft" size={18} /> Question bank</a>
          )}
          <div className="crumbs">
            {crumbs.map((c, i) => (
              <span key={i}>{i > 0 && <Icon name="chevron" size={14} />}{c}</span>
            ))}
          </div>
        </div>
        <div className="session-score">
          <span className="pill good"><Icon name="check" size={14} /> {session.correct}</span>
          <span className="pill bad"><Icon name="x" size={14} /> {session.answered - session.correct}</span>
        </div>
      </div>

      {!fixedList && (
        <div className="session-filters">
          <div className="seg small">
            {(["all", "easy", "medium", "hard"] as const).map((d) => (
              <button key={d} className={filters.difficulty === d ? "on" : ""} onClick={() => set({ difficulty: d })}>
                {d === "all" ? "Barcha qiyinlik" : DIFFICULTY_LABEL[d]}
              </button>
            ))}
          </div>
          <div className="seg small">
            {([["all", "Hammasi"], ["new", "Yechilmagan"], ["wrong", "Xatolar"]] as const).map(([v, l]) => (
              <button key={v} className={filters.status === v ? "on" : ""} onClick={() => set({ status: v })}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {queue.length > 0 && !finished && (
        <div className="session-progress">
          <div className="dots">
            {queue.length <= 30 ? (
              queue.map((_, i) => (
                <i key={i} className={i < results.length ? (results[i] ? "ok" : "no") : i === index ? "cur" : ""} />
              ))
            ) : (
              <div className="bar thin wide"><i className="solid" style={{ width: `${progressPct}%` }} /></div>
            )}
          </div>
          <span>{index + 1} / {queue.length}</span>
        </div>
      )}

      {queue.length === 0 ? (
        <div className="empty">
          <div className="big">🔍</div>
          <h3>Bu tanlov bo'yicha savol yo'q</h3>
          <p>Qiyinlik yoki holat filtrini o'zgartirib ko'ring.</p>
          <button className="btn btn-navy" onClick={() => set({ difficulty: "all", status: "all" })}>Filtrlarni tozalash</button>
        </div>
      ) : finished ? (
        <div className="finish-card">
          <div className="finish-emoji">{session.correct === session.answered ? "🏆" : "💪"}</div>
          <h2>{session.correct}/{session.answered} to'g'ri</h2>
          <p>
            {session.correct === session.answered
              ? "Hammasi to'g'ri — siz haqiqiy Acer'siz!"
              : "Xato qilgan savollaringiz Xatonomaga tushdi: ular 1, 3 va 7 kundan keyin qaytib keladi."}
          </p>
          <div className="dots big">
            {results.map((r, i) => <i key={i} className={r ? "ok" : "no"} />)}
          </div>
          <div className="finish-actions">
            {onFinish ? (
              <button className="btn btn-navy" onClick={onFinish}>Xatonomaga qaytish</button>
            ) : (
              <>
                <a className="btn btn-primary" href="/practice">Boshqa mavzu tanlash</a>
                <a className="btn btn-light" href="/mistakes">Xatonomani ochish</a>
              </>
            )}
          </div>
        </div>
      ) : (
        <QuestionCard
          q={q}
          picked={picked}
          setPicked={setPicked}
          spr={spr}
          setSpr={setSpr}
          checked={checked}
          correct={correct}
          lang={lang}
          setLang={setLang}
          canCheck={Boolean(canCheck)}
          onCheck={check}
          onNext={next}
          isLast={index + 1 === queue.length}
        />
      )}
    </div>
  );
}

interface CardProps {
  q: Question;
  picked: number | null;
  setPicked: (i: number) => void;
  spr: string;
  setSpr: (v: string) => void;
  checked: boolean;
  correct: boolean;
  lang: "uz" | "en";
  setLang: (l: "uz" | "en") => void;
  canCheck: boolean;
  onCheck: () => void;
  onNext: () => void;
  isLast: boolean;
}

function QuestionCard(props: CardProps) {
  const { q, picked, setPicked, spr, setSpr, checked, correct, lang, setLang, canCheck, onCheck, onNext, isLast } = props;

  const questionPart = (
    <div>
      {q.figure && <Figure spec={q.figure} />}
      <div className="stem"><RichText text={q.stem} math={q.section === "math"} /></div>
      {q.type === "mcq" && q.choices ? (
        <div className="choices" role="radiogroup">
          {q.choices.map((c, i) => {
            let cls = "choice";
            if (checked) {
              if (i === q.answer) cls += " right";
              else if (i === picked) cls += " wrong";
              else cls += " dim";
            } else if (i === picked) cls += " picked";
            return (
              <button key={i} type="button" role="radio" aria-checked={picked === i} className={cls} disabled={checked} onClick={() => setPicked(i)}>
                <span className="letter">{String.fromCharCode(65 + i)}</span>
                <span>{q.section === "math" ? renderMath(c) : c}</span>
                {checked && i === q.answer && <Icon name="check" size={18} className="choice-mark" />}
                {checked && i === picked && i !== q.answer && <Icon name="x" size={18} className="choice-mark" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <input className="spr-input" value={spr} onChange={(e) => setSpr(e.target.value)} disabled={checked} placeholder="Javobingiz" inputMode="decimal" aria-label="Javobingiz" />
          <div className="spr-hint">Butun son, o'nli kasr (2.5) yoki oddiy kasr (5/2) yozishingiz mumkin.</div>
        </div>
      )}

      {checked && (
        <div className={`result ${correct ? "ok" : "no"}`} aria-live="polite">
          <div className="result-head">
            <strong>{correct ? "To'g'ri! 🎉" : `Javob: ${correctAnswerLabel(q)}`}</strong>
            <span className="lang-toggle">
              <button className={lang === "uz" ? "on" : ""} onClick={() => setLang("uz")}>O'zbekcha</button>
              <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>English</button>
            </span>
          </div>
          <p>{renderMath(lang === "uz" ? q.explanation_uz : q.explanation_en)}</p>
          {!correct && <span className="chip-added">📒 Xatonomaga qo'shildi</span>}
        </div>
      )}
    </div>
  );

  return (
    <article className={`qcard ${q.section}`}>
      <div className="qcard-top">
        <div className="qmeta">
          <span className={`tag sec-${q.section}`}>{SECTION_LABEL[q.section]}</span>
          <span className="qskill">{q.skill}</span>
          <span className={`tag ${q.difficulty}`}>{DIFFICULTY_LABEL[q.difficulty]}</span>
        </div>
      </div>

      {q.passage ? (
        <div className="qbody split">
          <div className="passage"><RichText text={q.passage} /></div>
          {questionPart}
        </div>
      ) : (
        <div className="qbody">{questionPart}</div>
      )}

      <div className="qactions">
        <span className="kbd-hint"><kbd>A</kbd>–<kbd>D</kbd> tanlash · <kbd>Enter</kbd> tekshirish</span>
        {checked ? (
          <button className="btn btn-navy" onClick={onNext}>
            {isLast ? "Yakunlash" : "Keyingi savol"} <Icon name="arrowRight" size={16} />
          </button>
        ) : (
          <button className="btn btn-navy" onClick={onCheck} disabled={!canCheck}>Tekshirish</button>
        )}
      </div>
    </article>
  );
}
