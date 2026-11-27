"use client";

import { useState } from "react";

const DEMO = [
  {
    tag: "Math · Algebra",
    q: "If 3x + 5 = 26, what is the value of x?",
    choices: ["5", "7", "9", "21"],
    answer: 1,
    uz: "5 ni o'ngga o'tkazamiz: 3x = 21. Keyin 3 ga bo'lamiz: x = 7.",
  },
  {
    tag: "Reading & Writing · Grammar",
    q: "The team of engineers ___ the bridge every spring.",
    choices: ["inspect", "inspects", "are inspecting", "have inspected"],
    answer: 1,
    uz: "Ega — \"The team\" (birlik), \"engineers\" emas. Shuning uchun fe'l ham birlikda: inspects.",
  },
  {
    tag: "Math · Percentages",
    q: "A $40 book is on sale for 15% off. What is the sale price?",
    choices: ["$6", "$25", "$34", "$46"],
    answer: 2,
    uz: "40 ning 15% i = 6. Chegirmali narx: 40 − 6 = 34 dollar.",
  },
];

const MIN = 400;
const MAX = 1600;
const pctOf = (s: number) => ((s - MIN) / (MAX - MIN)) * 100;

export function HeroDemo() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(1180);
  const [gain, setGain] = useState<{ key: number; at: number } | null>(null);
  const d = DEMO[i % DEMO.length];
  const answered = picked !== null;
  const correct = picked === d.answer;

  function choose(c: number) {
    if (answered) return;
    setPicked(c);
    if (c === d.answer) {
      const next = Math.min(MAX, score + 40);
      setScore(next);
      setGain({ key: Date.now(), at: pctOf(next) });
    }
  }

  return (
    <div className="demo" aria-label="Jonli savol">
      <div className="demo-top">
        <span className="demo-live"><i /> Hoziroq sinab ko'ring</span>
        <span>{d.tag}</span>
      </div>
      <div className="q">{d.q}</div>
      <div className="choices">
        {d.choices.map((c, ci) => {
          let cls = "choice";
          if (answered) {
            if (ci === d.answer) cls += " right";
            else if (ci === picked) cls += " wrong";
          }
          return (
            <button key={ci} className={cls} disabled={answered} onClick={() => choose(ci)}>
              <span className="letter">{String.fromCharCode(65 + ci)}</span>
              <span>{c}</span>
            </button>
          );
        })}
      </div>

      <div className="demo-note" aria-live="polite">
        {!answered && "Javobni tanlang: to'g'ri bo'lsa, ballingiz o'sadi."}
        {answered && correct && <><b>To'g'ri!</b> {d.uz}</>}
        {answered && !correct && (
          <>
            <b>Xato, lekin bu yaxshi.</b> {d.uz}
            <br />
            <span className="chip-added">📒 Xatonomaga qo'shildi — 1 kundan keyin qaytadi</span>
          </>
        )}
      </div>

      {answered && (
        <button
          className="btn btn-light btn-sm"
          style={{ marginTop: 12 }}
          onClick={() => {
            setPicked(null);
            setI(i + 1);
          }}
        >
          Keyingi savol
        </button>
      )}

      <div className="track">
        <div className="track-head">
          <span>Taxminiy ballingiz</span>
          <b>{score}</b>
        </div>
        <div className="track-bar">
          <div className="track-fill" style={{ width: `${pctOf(score)}%` }} />
          <div className="track-marker" style={{ left: `${pctOf(score)}%` }} />
          {gain && (
            <span key={gain.key} className="track-gain" style={{ left: `${gain.at}%` }}>
              +40
            </span>
          )}
        </div>
        <div className="track-scale">
          <span>400</span>
          <span>1000</span>
          <span>1600</span>
        </div>
      </div>
    </div>
  );
}
