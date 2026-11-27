"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MOCK_BY_ID, isAdaptive, moduleQuestions, mockMinutes, mockQuestionCount, routeAfter, scoreMock, type MockResult } from "@/lib/mocks";
import { addResult, clearSession, loadHistory, loadSession, saveSession, type MockSession } from "@/lib/mockStore";
import { recordAnswer } from "@/lib/progress";
import { isCorrect } from "@/lib/questions";
import type { Question } from "@/lib/types";
import { MockResults } from "./MockResults";
import { DesmosSplit } from "./DesmosPanel";
import { Icon } from "./Icons";
import { Figure } from "./Figure";
import { RichText, renderMath } from "./MathText";
import { HighlightPassage, ReferenceSheet } from "./ExamTools";
import { shortDate } from "@/lib/format";

const SECTION_TITLE = { rw: "Reading and Writing", math: "Math" } as const;

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function MockRunner({ mockId }: { mockId: string }) {
  const mock = MOCK_BY_ID[mockId];
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState<MockSession | null>(null);
  const [result, setResult] = useState<MockResult | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [navOpen, setNavOpen] = useState(false);
  const [timerHidden, setTimerHidden] = useState(false);
  const [history, setHistory] = useState<MockResult[]>([]);

  useEffect(() => {
    setSession(loadSession(mockId));
    setHistory(loadHistory().filter((r) => r.mockId === mockId));
    setLoaded(true);
  }, [mockId]);

  useEffect(() => {
    if (session) saveSession(session);
  }, [session]);

  // Clock tick; also adds the elapsed time to the question on screen
  const active = !!session;
  useEffect(() => {
    if (!active) return;
    let last = Date.now();
    const t = window.setInterval(() => {
      const n = Date.now();
      const d = Math.min(n - last, 2000); // ignore gaps while the tab was asleep
      last = n;
      setNow(n);
      setSession((s) => {
        if (!s || s.phase !== "module") return s;
        const q = moduleQuestions(mock.modules[s.moduleIndex], s.routes)[s.qIndex];
        if (!q) return s;
        const times = s.times ?? {};
        return { ...s, times: { ...times, [q.id]: (times[q.id] ?? 0) + d } };
      });
    }, 500);
    return () => window.clearInterval(t);
  }, [active, mock]);

  const startModule = useCallback(
    (i: number, prev: MockSession) => ({
      ...prev,
      phase: "module" as const,
      moduleIndex: i,
      qIndex: 0,
      endsAt: Date.now() + mock.modules[i].minutes * 60_000,
    }),
    [mock]
  );

  const finishMock = useCallback(
    (s: MockSession) => {
      const r = scoreMock(mock, s.answers, s.routes ?? {}, s.times);
      addResult(r);
      // Record every answer in the Mistake Log and stats
      for (const mod of mock.modules) {
        for (const q of moduleQuestions(mod, s.routes)) {
          const a = s.answers[q.id];
          recordAnswer(q.id, a !== undefined && a !== "" && isCorrect(q, a), s.times?.[q.id]);
        }
      }
      clearSession(mock.id);
      setSession(null);
      setResult(r);
      window.scrollTo(0, 0);
    },
    [mock]
  );

  const finishModule = useCallback(
    (s: MockSession) => {
      setNavOpen(false);
      const next = s.moduleIndex + 1;
      const cur = mock.modules[s.moduleIndex];
      // Adaptive: Module 1 performance decides which Module 2 comes next
      if (cur.number === 1 && mock.modules[next]?.easierQuestionIds?.length) {
        s = { ...s, routes: { ...(s.routes ?? {}), [cur.section]: routeAfter(cur, s.answers) } };
      }
      if (next >= mock.modules.length) {
        finishMock(s);
        return;
      }
      const sectionChanges = mock.modules[next].section !== mock.modules[s.moduleIndex].section;
      if (sectionChanges && mock.breakMinutes > 0) {
        setSession({ ...s, phase: "break", endsAt: Date.now() + mock.breakMinutes * 60_000 });
      } else {
        setSession(startModule(next, s));
      }
    },
    [mock, finishMock, startModule]
  );

  // When time runs out: the module is submitted and the break ends automatically
  useEffect(() => {
    if (!session || now < session.endsAt) return;
    if (session.phase === "break") setSession(startModule(session.moduleIndex + 1, session));
    else finishModule(session);
  }, [now, session, finishModule, startModule]);

  if (!mock) return <div className="empty"><h3>Mock not found</h3></div>;
  if (!loaded) return null;

  if (result) {
    return (
      <MockResults
        mock={mock}
        result={result}
        onRetake={() => {
          setResult(null);
          setHistory(loadHistory().filter((r) => r.mockId === mockId));
        }}
      />
    );
  }

  if (!session) {
    return (
      <MockIntro
        title={mock.title}
        description={mock.description}
        questions={mockQuestionCount(mock)}
        minutes={mockMinutes(mock)}
        breakMinutes={mock.breakMinutes}
        modules={mock.modules.map((m) => ({ section: m.section, number: m.number, count: m.questionIds.length, minutes: m.minutes }))}
        adaptive={isAdaptive(mock)}
        history={history}
        onStart={() => {
          const base: MockSession = { mockId, phase: "module", moduleIndex: 0, qIndex: 0, answers: {}, flagged: {}, endsAt: 0 };
          setSession(startModule(0, base));
        }}
      />
    );
  }

  const remaining = session.endsAt - now;

  if (session.phase === "break") {
    return (
      <div className="exam break">
        <div className="break-card">
          <div className="big">☕</div>
          <h2>Break</h2>
          <div className="break-timer">{fmt(remaining)}</div>
          <p>Reading and Writing is done. Math is next. Drink some water and rest your eyes.</p>
          <button className="btn btn-primary" onClick={() => setSession(startModule(session.moduleIndex + 1, session))}>
            End break and start Math
          </button>
        </div>
      </div>
    );
  }

  return (
    <ExamScreen
      session={session}
      setSession={setSession}
      sectionNumber={mock.modules[session.moduleIndex].section === "rw" ? 1 : 2}
      module={mock.modules[session.moduleIndex]}
      questions={moduleQuestions(mock.modules[session.moduleIndex], session.routes)}
      remaining={remaining}
      timerHidden={timerHidden}
      setTimerHidden={setTimerHidden}
      navOpen={navOpen}
      setNavOpen={setNavOpen}
      isLastModule={session.moduleIndex === mock.modules.length - 1}
      onFinishModule={() => finishModule(session)}
    />
  );
}

/* ---------------- Intro ---------------- */

function MockIntro(props: {
  title: string;
  description?: string;
  questions: number;
  minutes: number;
  breakMinutes: number;
  modules: { section: "rw" | "math"; number: number; count: number; minutes: number }[];
  history: MockResult[];
  adaptive: boolean;
  onStart: () => void;
}) {
  const best = props.history.length ? Math.max(...props.history.map((r) => r.total)) : null;
  return (
    <div className="mock-intro">
      <a className="back" href="/mock"><Icon name="arrowLeft" size={18} /> Mock tests</a>
      <section className="intro-hero">
        <div>
          <h1>{props.title}</h1>
          {props.description && <p>{props.description}</p>}
          <div className="intro-chips">
            <span><Icon name="book" size={16} /> {props.questions} questions</span>
            <span><Icon name="clock" size={16} /> {props.minutes} minutes</span>
            <span>☕ {props.breakMinutes}-minute break</span>
            {props.adaptive && <span><Icon name="sparkle" size={16} /> Adaptive</span>}
            {best !== null && <span className="gold"><Icon name="trophy" size={16} /> Best: {best}</span>}
          </div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={props.onStart}>
          <Icon name="play" size={18} /> Start test
        </button>
      </section>

      <div className="timeline">
        {props.modules.map((m, i) => (
          <div key={i} className={`tl-step ${m.section}`}>
            <span className="tl-dot">{i + 1}</span>
            <div>
              <b>{SECTION_TITLE[m.section]}</b>
              <small>
                Module {m.number} · {m.count} questions · {m.minutes} min
                {props.adaptive && m.number === 2 && " · adapts to you"}
              </small>
            </div>
            {i === 1 && props.breakMinutes > 0 && <span className="tl-break">☕ {props.breakMinutes} min</span>}
          </div>
        ))}
      </div>

      {props.adaptive && (
        <p className="adaptive-note">
          Like the real SAT, this mock is adaptive: how you do on Module 1 decides whether Module 2 is harder or
          easier. Only the harder Module 2 can take you to the top of the score range.
        </p>
      )}

      <div className="rules-grid">
        <div className="rule"><Icon name="clock" /><p>Each module has its own timer. When time runs out, the module is submitted automatically.</p></div>
        <div className="rule"><Icon name="target" /><p>Not sure about a question? Use "Mark for Review" and come back to it at the end.</p></div>
        <div className="rule"><Icon name="calc" /><p>In Math, opening Desmos splits the screen: calculator on the left, question on the right.</p></div>
        <div className="rule"><Icon name="repeat" /><p>If you close the page, the test picks up where you left off, but the timer keeps running.</p></div>
      </div>

      {props.history.length > 0 && (
        <section className="tile-card" style={{ marginTop: 20 }}>
          <div className="card-label"><Icon name="trophy" size={18} /> Previous attempts</div>
          <div className="recent-list">
            {props.history.map((r) => (
              <div key={r.finishedAt} className="recent-row">
                <div><b>{shortDate(r.finishedAt)}</b><small>{r.sections.map((s) => s.score).join(" + ")}</small></div>
                <span className="recent-score">{r.total}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------------- Exam screen ---------------- */

function ExamScreen(props: {
  session: MockSession;
  setSession: (s: MockSession) => void;
  sectionNumber: number;
  module: { section: "rw" | "math"; number: number };
  questions: Question[];
  remaining: number;
  timerHidden: boolean;
  setTimerHidden: (v: boolean) => void;
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
  isLastModule: boolean;
  onFinishModule: () => void;
}) {
  const { session, setSession, questions, remaining, navOpen, setNavOpen } = props;
  const [desmosOpen, setDesmosOpen] = useState(false);
  const [refOpen, setRefOpen] = useState(false);
  const [elimMode, setElimMode] = useState(false);
  const [hlMode, setHlMode] = useState(false);
  const inReview = session.phase === "review";
  const q = questions[session.qIndex];
  const total = questions.length;
  const warn = remaining <= 5 * 60_000;

  const answered = useMemo(
    () => questions.map((x) => session.answers[x.id] !== undefined && session.answers[x.id] !== ""),
    [questions, session.answers]
  );

  const go = (i: number) => {
    setNavOpen(false);
    setSession({ ...session, phase: "module", qIndex: i });
  };
  const toReview = () => {
    setNavOpen(false);
    setSession({ ...session, phase: "review" });
  };
  const setAnswer = (v: number | string) => setSession({ ...session, answers: { ...session.answers, [q.id]: v } });
  const elim = session.eliminated?.[q.id] ?? [];
  const toggleElim = (i: number) => {
    const next = elim.includes(i) ? elim.filter((x) => x !== i) : [...elim, i];
    const answers = { ...session.answers };
    if (next.includes(i) && answers[q.id] === i) delete answers[q.id];
    setSession({ ...session, answers, eliminated: { ...(session.eliminated ?? {}), [q.id]: next } });
  };
  const pickChoice = (i: number) => {
    const eliminated = { ...(session.eliminated ?? {}), [q.id]: elim.filter((x) => x !== i) };
    setSession({ ...session, eliminated, answers: { ...session.answers, [q.id]: i } });
  };
  const toggleFlag = () => setSession({ ...session, flagged: { ...session.flagged, [q.id]: !session.flagged[q.id] } });

  const grid = (
    <div className="nav-grid">
      {questions.map((x, i) => (
        <button
          key={x.id}
          className={`nav-cell ${answered[i] ? "done" : ""} ${!inReview && i === session.qIndex ? "current" : ""}`}
          onClick={() => go(i)}
          aria-label={`Question ${i + 1}`}
        >
          {i + 1}
          {session.flagged[x.id] && <span className="flag">🚩</span>}
        </button>
      ))}
    </div>
  );

  return (
    <div className="exam">
      <header className="exam-top">
        <div className="exam-title">
          Section {props.sectionNumber}, Module {props.module.number}: {SECTION_TITLE[props.module.section]}
        </div>
        <div className={`exam-timer ${warn ? "warn" : ""}`}>
          {!props.timerHidden && <span>{fmt(remaining)}</span>}
          <button className="link-btn" onClick={() => props.setTimerHidden(!props.timerHidden)}>
            {props.timerHidden ? "Show" : "Hide"}
          </button>
        </div>
        <div className="exam-tools">
          {props.module.section === "rw" && !inReview && q?.passage && !q.passage.includes(" — ") && (
            <button className={`tool-btn ${hlMode ? "on" : ""}`} onClick={() => setHlMode(!hlMode)} title="Highlight text">
              <span className="tool-ico">🖍</span> Highlight
            </button>
          )}
          {props.module.section === "math" && (
            <button className="tool-btn" onClick={() => setRefOpen(true)} title="Reference sheet">
              <span className="tool-ico">📐</span> Reference
            </button>
          )}
          {props.module.section === "math" && (
            <button className={`btn btn-sm ${desmosOpen ? "btn-navy" : "btn-light"}`} onClick={() => setDesmosOpen(!desmosOpen)}>
              🧮 Desmos
            </button>
          )}
        </div>
      </header>

      <main className="exam-body">
        <DesmosSplit open={props.module.section === "math" && desmosOpen} onClose={() => setDesmosOpen(false)}>
        {inReview ? (
          <div className="review">
            <h2>Check Your Work</h2>
            <p>
              Unanswered: <b>{answered.filter((a) => !a).length}</b> · For review:{" "}
              <b>{questions.filter((x) => session.flagged[x.id]).length}</b>. Select a number to go back to that question.
            </p>
            <div className="review-legend">
              <span><i className="lg done" /> Answered</span>
              <span><i className="lg" /> Unanswered</span>
              <span>🚩 For Review</span>
            </div>
            {grid}
          </div>
        ) : (
          <div className={`exam-q ${q.passage ? "split" : ""}`}>
            {q.passage && (
              <div className="passage exam-pane">
                <HighlightPassage
                  text={q.passage}
                  enabled={hlMode}
                  ranges={session.highlights?.[q.id] ?? []}
                  onChange={(r) => setSession({ ...session, highlights: { ...(session.highlights ?? {}), [q.id]: r } })}
                />
              </div>
            )}
            <div className="exam-pane">
              <div className="q-head">
                <span className="q-num">{session.qIndex + 1}</span>
                <button className={`mark ${session.flagged[q.id] ? "on" : ""}`} onClick={toggleFlag}>
                  {session.flagged[q.id] ? "🚩" : "⚐"} Mark for Review
                </button>
                {q.type === "mcq" && (
                  <button className={`abc ${elimMode ? "on" : ""}`} onClick={() => setElimMode(!elimMode)} title="Answer eliminator: cross out wrong choices">
                    <s>ABC</s>
                  </button>
                )}
              </div>
              {q.figure && <Figure spec={q.figure} />}
              <div className="stem"><RichText text={q.stem} math={q.section === "math"} /></div>
              {q.type === "mcq" && q.choices ? (
                <div className="choices">
                  {q.choices.map((c, i) => {
                    const out = elim.includes(i);
                    return (
                      <div key={i} className={`choice-row ${out ? "out" : ""}`}>
                        <button
                          className={`choice ${session.answers[q.id] === i ? "picked" : ""} ${out ? "struck" : ""}`}
                          onClick={() => pickChoice(i)}
                        >
                          <span className="letter">{String.fromCharCode(65 + i)}</span>
                          <span className="choice-text">{q.section === "math" ? renderMath(c) : c}</span>
                        </button>
                        {elimMode && (
                          <button className="elim-btn" onClick={() => toggleElim(i)} aria-label={out ? "Qaytarish" : "Chizib tashlash"}>
                            {out ? "Undo" : <s>{String.fromCharCode(65 + i)}</s>}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <input
                    className="spr-input"
                    value={String(session.answers[q.id] ?? "")}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Your answer"
                    inputMode="decimal"
                    aria-label="Your answer"
                  />
                  <div className="spr-hint">Enter an integer, a decimal (2.5) or a fraction (5/2).</div>
                </div>
              )}
            </div>
          </div>
        )}
        </DesmosSplit>
      </main>

      <footer className="exam-bottom">
        <span className="exam-brand">SAT Acers</span>
        {!inReview ? (
          <button className="nav-toggle" onClick={() => setNavOpen(!navOpen)}>
            Question {session.qIndex + 1} of {total} {navOpen ? "▼" : "▲"}
          </button>
        ) : (
          <span />
        )}
        <div className="exam-actions">
          {inReview ? (
            <>
              <button className="btn btn-light" onClick={() => go(total - 1)}>Back</button>
              <button className="btn btn-navy" onClick={props.onFinishModule}>
                {props.isLastModule ? "Finish test" : "Next module"}
              </button>
            </>
          ) : (
            <>
              {session.qIndex > 0 && (
                <button className="btn btn-light" onClick={() => go(session.qIndex - 1)}>Back</button>
              )}
              <button
                className="btn btn-navy"
                onClick={() => (session.qIndex + 1 < total ? go(session.qIndex + 1) : toReview())}
              >
                Next
              </button>
            </>
          )}
        </div>
      </footer>

      {refOpen && <ReferenceSheet onClose={() => setRefOpen(false)} />}

      {navOpen && !inReview && (
        <div className="nav-pop" role="dialog" aria-label="Questions">
          <div className="nav-pop-head">
            Section {props.sectionNumber}, Module {props.module.number}: {SECTION_TITLE[props.module.section]}
          </div>
          {grid}
          <button className="btn btn-light" style={{ width: "100%", marginTop: 12 }} onClick={toReview}>
            Go to Review Page
          </button>
        </div>
      )}
    </div>
  );
}
