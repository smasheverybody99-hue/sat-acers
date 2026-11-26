"use client";

import { useState } from "react";
import { Practice } from "./Practice";
import { QUESTION_BY_ID } from "@/lib/questions";
import { REVIEW_INTERVALS_DAYS, currentStreak, todayAnswered } from "@/lib/progress";
import { useProgress } from "@/lib/useProgress";

const DAILY_GOAL = 5;

function dueLabel(due: number, now: number): string {
  if (due <= now) return "Hozir takrorlang";
  const days = Math.ceil((due - now) / (24 * 60 * 60 * 1000));
  return days === 1 ? "Ertaga" : `${days} kundan keyin`;
}

export function Mistakes() {
  const progress = useProgress();
  const [reviewIds, setReviewIds] = useState<string[] | null>(null);

  if (!progress) return null; // localStorage o'qilguncha

  if (reviewIds) {
    return <Practice ids={reviewIds} onFinish={() => setReviewIds(null)} />;
  }

  const now = Date.now();
  const entries = Object.entries(progress.mistakes)
    .filter(([id]) => QUESTION_BY_ID[id])
    .sort((a, b) => a[1].due - b[1].due);
  const dueIds = entries.filter(([, m]) => m.due <= now).map(([id]) => id);

  const attempts = Object.values(progress.attempts);
  const solved = attempts.length;
  const accuracy = solved ? Math.round((attempts.filter((a) => a.lastCorrect).length / solved) * 100) : 0;
  const today = todayAnswered(progress);

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="stats">
        <div className="stat">
          <span>🔥 Streak</span>
          <b>{currentStreak(progress)} kun</b>
        </div>
        <div className="stat">
          <span>Bugungi maqsad</span>
          <b>
            {Math.min(today, DAILY_GOAL)}/{DAILY_GOAL} {today >= DAILY_GOAL ? "✅" : ""}
          </b>
        </div>
        <div className="stat">
          <span>Yechilgan savollar · aniqlik</span>
          <b>
            {solved} · {accuracy}%
          </b>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty">
          <div className="big">📒</div>
          <h3>Xatonoma hozircha bo'sh</h3>
          <p>Xato qilgan har bir savolingiz shu yerga tushadi va 1, 3, 7 kundan keyin qayta so'raladi.</p>
          <a className="btn btn-navy" href="/practice">Mashqni boshlash</a>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 14px", gap: 12, flexWrap: "wrap" }}>
            <div style={{ color: "var(--muted)" }}>
              Jami <b style={{ color: "var(--ink)" }}>{entries.length}</b> ta, bugun takrorlash kerak:{" "}
              <b style={{ color: "var(--ink)" }}>{dueIds.length}</b> ta
            </div>
            <button className="btn btn-primary" disabled={dueIds.length === 0} onClick={() => setReviewIds(dueIds)}>
              {dueIds.length ? `${dueIds.length} ta savolni takrorlash` : "Bugun takrorlash yo'q 🎉"}
            </button>
          </div>
          <div className="mistake-list">
            {entries.map(([id, m]) => {
              const q = QUESTION_BY_ID[id];
              return (
                <div key={id} className="mistake">
                  <div style={{ minWidth: 0 }}>
                    <div className="txt">{q.passage ?? q.stem}</div>
                    <div className="sub">
                      {q.domain} · {q.skill}
                      <span className="stage-dots" title={`${m.stage}/${REVIEW_INTERVALS_DAYS.length} bosqich`}>
                        {REVIEW_INTERVALS_DAYS.map((_, i) => (
                          <i key={i} className={i < m.stage ? "on" : ""} />
                        ))}
                      </span>
                    </div>
                  </div>
                  <span className={`due ${m.due <= now ? "now" : "later"}`}>{dueLabel(m.due, now)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
