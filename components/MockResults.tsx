"use client";

import { useState } from "react";
import { moduleQuestions, type Mock, type MockResult } from "@/lib/mocks";
import { correctAnswerLabel, isCorrect } from "@/lib/questions";
import { SECTION_LABEL, type Question } from "@/lib/types";
import { Ring } from "./Ring";

function answerLabel(q: Question, a: number | string | undefined): string {
  if (a === undefined || a === "") return "—";
  return q.type === "mcq" ? String.fromCharCode(65 + (a as number)) : String(a);
}

export function MockResults({ mock, result, onRetake }: { mock: Mock; result: MockResult; onRetake: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [lang, setLang] = useState<"uz" | "en">("uz");
  const correct = result.sections.reduce((n, s) => n + s.correct, 0);
  const total = result.sections.reduce((n, s) => n + s.total, 0);

  return (
    <div className="results">
      <div className="score-hero">
        <div className="score-hero-main">
          <Ring value={(result.total - 400) / 1200} size={180} stroke={14} id="ring-result">
            <b className="score-big">{result.total}</b>
            <small>taxminiy ball</small>
          </Ring>
          <div>
            <span className="eyebrow"><span className="dot" /> {mock.title}</span>
            <h2 className="score-title">
              {result.total >= 1400 ? "Ajoyib natija! 🏆" : result.total >= 1100 ? "Yaxshi natija! 💪" : "Boshlanish yaxshi! 🌱"}
            </h2>
            <div className="score-sub">{correct}/{total} to'g'ri javob</div>
          </div>
        </div>
        <div className="score-sections">
          {result.sections.map((s) => (
            <div key={s.section} className="score-sec">
              <span>{SECTION_LABEL[s.section]}</span>
              <b>{s.score}</b>
              <small>{s.correct}/{s.total} to'g'ri</small>
            </div>
          ))}
        </div>
      </div>
      <p className="score-note">
        Bu ball taxminiy: haqiqiy SAT adaptiv va savollarning og'irligi har xil. Mo'ljal sifatida foydalaning.
      </p>

      <h3 className="results-h">Domenlar bo'yicha</h3>
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

      <h3 className="results-h">Savollar tahlili</h3>
      {mock.modules.map((mod, mi) => (
        <div key={mi} style={{ marginBottom: 18 }}>
          <div className="module-label">
            {SECTION_LABEL[mod.section]} — Module {mod.number}
          </div>
          <div className="mistake-list">
            {moduleQuestions(mod).map((q, i) => {
              const a = result.answers[q.id];
              const ok = a !== undefined && a !== "" && isCorrect(q, a);
              const isOpen = open === q.id;
              return (
                <div key={q.id} className={`review-item ${ok ? "ok" : "no"}`}>
                  <button className="review-row" onClick={() => setOpen(isOpen ? null : q.id)}>
                    <span className="ri-num">{i + 1}</span>
                    <span className="ri-mark">{ok ? "✅" : "❌"}</span>
                    <span className="ri-text">{q.domain} · {q.skill}</span>
                    <span className="ri-ans">
                      Siz: <b>{answerLabel(q, a)}</b> · To'g'ri: <b>{correctAnswerLabel(q)}</b>
                    </span>
                    <span className="ri-chev">{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <div className="ri-body">
                      {q.passage && <div className="passage" style={{ marginBottom: 12 }}>{q.passage}</div>}
                      <div className="stem">{q.stem}</div>
                      {q.choices && (
                        <ol className="ri-choices" type="A">
                          {q.choices.map((c, ci) => (
                            <li key={ci} className={ci === q.answer ? "right" : ci === a ? "wrong" : ""}>{c}</li>
                          ))}
                        </ol>
                      )}
                      <div className={`result ${ok ? "ok" : "no"}`}>
                        <div className="result-head">
                          <strong>Tushuntirish</strong>
                          <span className="lang-toggle">
                            <button className={lang === "uz" ? "on" : ""} onClick={() => setLang("uz")}>O'zbekcha</button>
                            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>English</button>
                          </span>
                        </div>
                        <p>{lang === "uz" ? q.explanation_uz : q.explanation_en}</p>
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
        <a className="btn btn-primary" href="/mistakes">📒 Xatonomani ochish</a>
        <button className="btn btn-light" onClick={onRetake}>Qayta topshirish</button>
        <a className="btn btn-light" href="/mock">Boshqa mocklar</a>
      </div>
    </div>
  );
}
