"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QUESTIONS, QUESTION_BY_ID, correctAnswerLabel, isCorrect } from "@/lib/questions";
import { loadProgress, recordAnswer } from "@/lib/progress";
import { DIFFICULTY_LABEL, DOMAINS, SECTION_LABEL, type Difficulty, type Question, type Section } from "@/lib/types";

type StatusFilter = "all" | "new" | "wrong";

interface Filters {
  section: Section | "all";
  domain: string | "all";
  difficulty: Difficulty | "all";
  status: StatusFilter;
}

const DEFAULT_FILTERS: Filters = { section: "all", domain: "all", difficulty: "all", status: "all" };

function applyFilters(f: Filters): Question[] {
  const p = f.status === "all" ? null : loadProgress();
  return QUESTIONS.filter((q) => {
    if (f.section !== "all" && q.section !== f.section) return false;
    if (f.domain !== "all" && q.domain !== f.domain) return false;
    if (f.difficulty !== "all" && q.difficulty !== f.difficulty) return false;
    if (p && f.status === "new" && p.attempts[q.id]) return false;
    if (p && f.status === "wrong" && !(p.attempts[q.id] && !p.attempts[q.id].lastCorrect)) return false;
    return true;
  });
}

export function Practice({ ids, onFinish }: { ids?: string[]; onFinish?: () => void }) {
  const reviewMode = Boolean(ids);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [queue, setQueue] = useState<Question[]>(() =>
    ids ? ids.map((id) => QUESTION_BY_ID[id]).filter(Boolean) : applyFilters(DEFAULT_FILTERS)
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [spr, setSpr] = useState("");
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [lang, setLang] = useState<"uz" | "en">("uz");
  const [session, setSession] = useState({ answered: 0, correct: 0 });

  // Filtr o'zgarganda navbat qaytadan tuziladi (javob berish jarayonida emas — shunda savol "sakrab" ketmaydi)
  useEffect(() => {
    if (reviewMode) return;
    setQueue(applyFilters(filters));
    setIndex(0);
    resetAnswer();
    setSession({ answered: 0, correct: 0 });
  }, [filters, reviewMode]);

  const q = queue[index];
  const finished = queue.length > 0 && index >= queue.length;

  function resetAnswer() {
    setPicked(null);
    setSpr("");
    setChecked(false);
    setCorrect(false);
  }

  const canCheck = q && !checked && (q.type === "mcq" ? picked !== null : spr.trim() !== "");

  const check = useCallback(() => {
    if (!q || checked) return;
    const response = q.type === "mcq" ? picked : spr;
    if (response === null || response === "") return;
    const ok = isCorrect(q, response);
    setCorrect(ok);
    setChecked(true);
    setSession((s) => ({ answered: s.answered + 1, correct: s.correct + (ok ? 1 : 0) }));
    recordAnswer(q.id, ok);
  }, [q, checked, picked, spr]);

  const next = useCallback(() => {
    resetAnswer();
    setIndex((i) => i + 1);
  }, []);

  // Klaviatura: A–D variant tanlash, Enter — tekshirish / keyingi
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!q) return;
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT";
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

  const domainOptions = useMemo(
    () => (filters.section === "all" ? [...DOMAINS.math, ...DOMAINS.rw] : DOMAINS[filters.section]),
    [filters.section]
  );

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <div className="practice" style={reviewMode ? { gridTemplateColumns: "1fr" } : undefined}>
      {!reviewMode && (
        <aside className="filters" aria-label="Filtrlar">
          <div className="filter-group">
            <h4>Bo'lim</h4>
            <div className="chips">
              <Chip on={filters.section === "all"} onClick={() => set({ section: "all", domain: "all" })}>Hammasi</Chip>
              {(Object.keys(SECTION_LABEL) as Section[]).map((s) => (
                <Chip key={s} on={filters.section === s} onClick={() => set({ section: s, domain: "all" })}>
                  {SECTION_LABEL[s]}
                </Chip>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <h4>Domen</h4>
            <div className="chips">
              <Chip on={filters.domain === "all"} onClick={() => set({ domain: "all" })}>Hammasi</Chip>
              {domainOptions.map((d) => (
                <Chip key={d} on={filters.domain === d} onClick={() => set({ domain: d })}>{d}</Chip>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <h4>Qiyinlik</h4>
            <div className="chips">
              <Chip on={filters.difficulty === "all"} onClick={() => set({ difficulty: "all" })}>Hammasi</Chip>
              {(Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((d) => (
                <Chip key={d} on={filters.difficulty === d} onClick={() => set({ difficulty: d })}>
                  {DIFFICULTY_LABEL[d]}
                </Chip>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <h4>Holat</h4>
            <div className="chips">
              <Chip on={filters.status === "all"} onClick={() => set({ status: "all" })}>Hammasi</Chip>
              <Chip on={filters.status === "new"} onClick={() => set({ status: "new" })}>Yechilmagan</Chip>
              <Chip on={filters.status === "wrong"} onClick={() => set({ status: "wrong" })}>Xato qilinganlar</Chip>
            </div>
          </div>
          <div className="filter-count">
            Topildi: <b>{queue.length}</b> ta savol
            {session.answered > 0 && (
              <>
                <br />
                Bu sessiyada: <b>{session.correct}/{session.answered}</b> to'g'ri
              </>
            )}
          </div>
        </aside>
      )}

      <section>
        {queue.length === 0 ? (
          <div className="empty">
            <div className="big">🔍</div>
            <h3>Bu filtr bo'yicha savol yo'q</h3>
            <p>Filtrlarni kengaytirib ko'ring.</p>
            <button className="btn btn-navy" onClick={() => setFilters(DEFAULT_FILTERS)}>Filtrlarni tozalash</button>
          </div>
        ) : finished ? (
          <div className="empty">
            <div className="big">{session.correct === session.answered ? "🏆" : "💪"}</div>
            <h3>
              Barakalla! {session.correct}/{session.answered} to'g'ri
            </h3>
            <p>
              {session.correct === session.answered
                ? "Hammasi to'g'ri — siz haqiqiy Acer'siz!"
                : "Xato qilgan savollaringiz Xatonomaga tushdi — ular 1, 3 va 7 kundan keyin qaytib keladi."}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {reviewMode ? (
                <button className="btn btn-navy" onClick={onFinish}>Xatonomaga qaytish</button>
              ) : (
                <>
                  <button
                    className="btn btn-navy"
                    onClick={() => {
                      setQueue(applyFilters(filters));
                      setIndex(0);
                      resetAnswer();
                      setSession({ answered: 0, correct: 0 });
                    }}
                  >
                    Qaytadan boshlash
                  </button>
                  <a className="btn btn-light" href="/mistakes">Xatonomani ochish</a>
                </>
              )}
            </div>
          </div>
        ) : (
          <QuestionCard
            q={q}
            index={index}
            total={queue.length}
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
          />
        )}
      </section>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`chip ${on ? "on" : ""}`} onClick={onClick} aria-pressed={on}>
      {children}
    </button>
  );
}

interface CardProps {
  q: Question;
  index: number;
  total: number;
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
}

function QuestionCard(props: CardProps) {
  const { q, index, total, picked, setPicked, spr, setSpr, checked, correct, lang, setLang, canCheck, onCheck, onNext } = props;
  const hasPassage = Boolean(q.passage);

  const questionPart = (
    <div>
      <div className="stem">{q.stem}</div>
      {q.type === "mcq" && q.choices ? (
        <div className="choices" role="radiogroup">
          {q.choices.map((c, i) => {
            let cls = "choice";
            if (checked) {
              if (i === q.answer) cls += " right";
              else if (i === picked) cls += " wrong";
            } else if (i === picked) cls += " picked";
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={picked === i}
                className={cls}
                disabled={checked}
                onClick={() => setPicked(i)}
              >
                <span className="letter">{String.fromCharCode(65 + i)}</span>
                <span>{c}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <input
            className="spr-input"
            value={spr}
            onChange={(e) => setSpr(e.target.value)}
            disabled={checked}
            placeholder="Javobingiz"
            inputMode="decimal"
            aria-label="Javobingiz"
          />
          <div className="spr-hint">Butun son, o'nli kasr (2.5) yoki oddiy kasr (5/2) yozishingiz mumkin.</div>
        </div>
      )}

      {checked && (
        <div className={`result ${correct ? "ok" : "no"}`} aria-live="polite">
          <div className="result-head">
            <strong>{correct ? "✅ To'g'ri!" : `❌ Xato. To'g'ri javob: ${correctAnswerLabel(q)}`}</strong>
            <span className="lang-toggle">
              <button className={lang === "uz" ? "on" : ""} onClick={() => setLang("uz")}>O'zbekcha</button>
              <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>English</button>
            </span>
          </div>
          <p>{lang === "uz" ? q.explanation_uz : q.explanation_en}</p>
        </div>
      )}
    </div>
  );

  return (
    <article className="qcard">
      <div className="qcard-top">
        <div className="qmeta">
          <span className="tag">{SECTION_LABEL[q.section]}</span>
          <span className="tag">{q.domain}</span>
          <span style={{ color: "var(--muted)" }}>{q.skill}</span>
          <span className={`tag ${q.difficulty}`}>{DIFFICULTY_LABEL[q.difficulty]}</span>
        </div>
        <span className="qcounter">
          {index + 1} / {total}
        </span>
      </div>

      {hasPassage ? (
        <div className="qbody split">
          <div className="passage">{q.passage}</div>
          {questionPart}
        </div>
      ) : (
        <div className="qbody">{questionPart}</div>
      )}

      <div className="qactions">
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          Maslahat: A–D tugmalari bilan tanlang, Enter bilan tekshiring
        </span>
        {checked ? (
          <button className="btn btn-navy" onClick={onNext}>
            {index + 1 === total ? "Yakunlash" : "Keyingi →"}
          </button>
        ) : (
          <button className="btn btn-navy" onClick={onCheck} disabled={!canCheck}>
            Tekshirish
          </button>
        )}
      </div>
    </article>
  );
}
