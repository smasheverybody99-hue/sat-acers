"use client";

import { useState } from "react";
import { moduleQuestions, type Mock, type MockResult } from "@/lib/mocks";
import { correctAnswerLabel, isCorrect } from "@/lib/questions";
import { SECTION_LABEL, type Question } from "@/lib/types";
import { Ring } from "./Ring";
import { Figure } from "./Figure";
import { RichText, renderMath } from "./MathText";

/** Target pace on the real SAT: R&W 32 min / 27 questions, Math 35 min / 22 questions */
export const PACE_SEC = { rw: 71, math: 95 } as const;

export function fmtSec(ms: number): string {
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : `${s}s`;
}

function answerLabel(q: Question, a: number | string | undefined): string {
  if (a === undefined || a === "") return "—";
  return q.type === "mcq" ? String.fromCharCode(65 + (a as number)) : String(a);
}

export function MockResults({ mock, result, onRetake }: { mock: Mock; result: MockResult; onRetake: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const correct = result.sections.reduce((n, s) => n + s.correct, 0);
  const total = result.sections.reduce((n, s) => n + s.total, 0);

  return (
    <div className="results">
      <div className="score-hero">
        <div className="score-hero-main">
          <Ring value={(result.total - 400) / 1200} size={180} stroke={14} id="ring-result">
            <b className="score-big">{result.total}</b>
            <small>estimated score</small>
          </Ring>
          <div>
            <span className="eyebrow"><span className="dot" /> {mock.title}</span>
            <h2 className="score-title">
              {result.total >= 1400 ? "Outstanding! 🏆" : result.total >= 1100 ? "Solid result! 💪" : "Good start! 🌱"}
            </h2>
            <div className="score-sub">{correct}/{total} correct</div>
          </div>
        </div>
        <div className="score-sections">
          {result.sections.map((s) => (
            <div key={s.section} className="score-sec">
              <span>{SECTION_LABEL[s.section]}</span>
              <b>{s.score}</b>
              <small>{s.correct}/{s.total} correct</small>
              {s.route && (
                <span className={`route-chip ${s.route}`} title="Which Module 2 you were routed to">
                  Module 2: {s.route === "harder" ? "Harder" : "Easier"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="score-note">
        {result.routes && Object.values(result.routes).includes("easier")
          ? "This score is an estimate. You got the easier Module 2 in at least one section, which caps the score a little below 600 there, just like the real SAT. Aim for about 55% or more on Module 1 to unlock the harder Module 2."
          : "This score is an estimate based on an adaptive model of the real SAT. Use it as a guide."}
      </p>

      {result.times && <TimeSummary mock={mock} result={result} onOpen={setOpen} />}

      <h3 className="results-h">By domain</h3>
      <div className="domain-list">
        {result.domains.map((d) => {
          const pct = Math.round((d.correct / d.total) * 100);
          return (
            <div key={d.section + d.domain} className="domain-row">
              <div className="domain-name">
                <span>{d.domain}</span>
                <small>{SECTION_LABEL[d.section]}</small>
              </div>
              <div className="bar"><i style={{ width: `${pct}%` }} className={pct >= 70 ? "good" : pct >= 40 ? "mid" : "low"} /></div>
              <b>{d.correct}/{d.total}</b>
            </div>
          );
        })}
      </div>

      <h3 className="results-h">Question review</h3>
      {mock.modules.map((mod, mi) => (
        <div key={mi} style={{ marginBottom: 18 }}>
          <div className="module-label">
            {SECTION_LABEL[mod.section]} — Module {mod.number}
            {mod.number === 2 && result.routes?.[mod.section] && ` (${result.routes[mod.section] === "harder" ? "harder" : "easier"})`}
          </div>
          <div className="mistake-list">
            {moduleQuestions(mod, result.routes).map((q, i) => {
              const a = result.answers[q.id];
              const ok = a !== undefined && a !== "" && isCorrect(q, a);
              const isOpen = open === q.id;
              return (
                <div key={q.id} id={`ri-${q.id}`} className={`review-item ${ok ? "ok" : "no"}`}>
                  <button className="review-row" onClick={() => setOpen(isOpen ? null : q.id)}>
                    <span className="ri-num">{i + 1}</span>
                    <span className="ri-mark">{ok ? "✅" : "❌"}</span>
                    <span className="ri-text">{q.domain} · {q.skill}</span>
                    <span className="ri-ans">
                      You: <b>{answerLabel(q, a)}</b> · Correct: <b>{correctAnswerLabel(q)}</b>
                    </span>
                    {result.times?.[q.id] !== undefined && <span className="ri-time">{fmtSec(result.times[q.id])}</span>}
                    <span className="ri-chev">{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <div className="ri-body">
                      {q.passage && <div className="passage" style={{ marginBottom: 12 }}><RichText text={q.passage} /></div>}
                      {q.figure && <Figure spec={q.figure} />}
                      <div className="stem"><RichText text={q.stem} math={q.section === "math"} /></div>
                      {q.choices && (
                        <ol className="ri-choices" type="A">
                          {q.choices.map((c, ci) => (
                            <li key={ci} className={ci === q.answer ? "right" : ci === a ? "wrong" : ""}>{q.section === "math" ? renderMath(c) : c}</li>
                          ))}
                        </ol>
                      )}
                      <div className={`result ${ok ? "ok" : "no"}`}>
                        <div className="result-head">
                          <strong>Explanation</strong>
                        </div>
                        <p>{renderMath(q.explanation_en)}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
        <a className="btn btn-primary" href="/mistakes">📒 Open Mistake Log</a>
        <button className="btn btn-light" onClick={onRetake}>Retake</button>
        <a className="btn btn-light" href="/mock">Other mocks</a>
      </div>
    </div>
  );
}

function TimeSummary({ mock, result, onOpen }: { mock: Mock; result: MockResult; onOpen: (id: string) => void }) {
  const times = result.times ?? {};
  const sections = (["rw", "math"] as const)
    .map((sec) => {
      const qs = mock.modules.filter((m) => m.section === sec).flatMap((m) => moduleQuestions(m, result.routes));
      const timed = qs.filter((q) => times[q.id] !== undefined);
      const total = timed.reduce((n, q) => n + times[q.id], 0);
      return { sec, count: timed.length, total, avg: timed.length ? total / timed.length : 0 };
    })
    .filter((s) => s.count > 0);
  const all = mock.modules.flatMap((m) => moduleQuestions(m, result.routes));
  const slowest = all
    .filter((q) => times[q.id] !== undefined)
    .sort((a, b) => times[b.id] - times[a.id])
    .slice(0, 5);
  if (!sections.length) return null;

  return (
    <>
      <h3 className="results-h">Timing</h3>
      <div className="time-grid">
        {sections.map((s) => {
          const pace = PACE_SEC[s.sec] * 1000;
          const ratio = s.avg / pace;
          return (
            <div key={s.sec} className="time-card">
              <span>{SECTION_LABEL[s.sec]}</span>
              <b>{fmtSec(s.avg)}</b>
              <small>average per question · target {fmtSec(pace)}</small>
              <div className="bar"><i style={{ width: `${Math.min(100, ratio * 100)}%` }} className={ratio <= 1 ? "good" : ratio <= 1.25 ? "mid" : "low"} /></div>
              <small>Total: {fmtSec(s.total)}</small>
            </div>
          );
        })}
        <div className="time-card slow">
          <span>Slowest questions</span>
          <ol>
            {slowest.map((q) => {
              const a = result.answers[q.id];
              const ok = a !== undefined && a !== "" && isCorrect(q, a);
              return (
                <li key={q.id}>
                  <button
                    onClick={() => {
                      onOpen(q.id);
                      setTimeout(() => document.getElementById(`ri-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
                    }}
                  >
                    <b>{fmtSec(times[q.id])}</b> {ok ? "✅" : "❌"} {q.skill}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </>
  );
}
