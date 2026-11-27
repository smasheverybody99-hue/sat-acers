"use client";

import { useState } from "react";
import { Icon } from "./Icons";
import { Practice } from "./Practice";
import { QUESTION_BY_ID } from "@/lib/questions";
import { REVIEW_INTERVALS_DAYS, type MistakeEntry } from "@/lib/progress";
import { useProgress } from "@/lib/useProgress";
import { SECTION_LABEL } from "@/lib/types";

const DAY = 86400000;

function bucket(due: number, now: number): "now" | "soon" | "later" {
  if (due <= now) return "now";
  if (due - now <= DAY) return "soon";
  return "later";
}

function dueLabel(due: number, now: number) {
  if (due <= now) return "Now";
  const d = Math.ceil((due - now) / DAY);
  return d === 1 ? "Tomorrow" : `In ${d} days`;
}

export function Mistakes() {
  const progress = useProgress();
  const [reviewIds, setReviewIds] = useState<string[] | null>(null);

  if (!progress) return null;
  if (reviewIds) return <Practice ids={reviewIds} title="Mistake Log review" onFinish={() => setReviewIds(null)} />;

  const now = Date.now();
  const entries = Object.entries(progress.mistakes)
    .filter(([id]) => QUESTION_BY_ID[id])
    .sort((a, b) => a[1].due - b[1].due);
  const cols = {
    now: entries.filter(([, m]) => bucket(m.due, now) === "now"),
    soon: entries.filter(([, m]) => bucket(m.due, now) === "soon"),
    later: entries.filter(([, m]) => bucket(m.due, now) === "later"),
  };
  const mastered = Object.entries(progress.attempts).filter(([id, a]) => a.tries > 1 && a.lastCorrect && !progress.mistakes[id]).length;

  return (
    <div className="xn">
      <div className="page-head">
        <div>
          <h1>Mistake Log</h1>
          <p>Your mistakes are your best teacher. Each one comes back after 1, 3 and 7 days. Get it right three times and it's mastered.</p>
        </div>
        <button className="btn btn-primary" disabled={!cols.now.length} onClick={() => setReviewIds(cols.now.map(([id]) => id))}>
          <Icon name="play" size={16} /> {cols.now.length ? `Review ${cols.now.length} ${cols.now.length === 1 ? "question" : "questions"}` : "Nothing to review today"}
        </button>
      </div>

      <div className="xn-stats">
        <div className="xn-stat hot"><b>{cols.now.length}</b><span>due today</span></div>
        <div className="xn-stat"><b>{entries.length}</b><span>in the log</span></div>
        <div className="xn-stat good"><b>{mastered}</b><span>mastered</span></div>
      </div>

      {entries.length === 0 ? (
        <div className="empty">
          <div className="big">📒</div>
          <h3>Your Mistake Log is empty</h3>
          <p>Every question you miss lands here and comes back on the right day.</p>
          <a className="btn btn-navy" href="/practice">Start practicing</a>
        </div>
      ) : (
        <div className="kanban">
          <Column title="Today" tone="now" items={cols.now} now={now} />
          <Column title="Tomorrow" tone="soon" items={cols.soon} now={now} />
          <Column title="Later" tone="later" items={cols.later} now={now} />
        </div>
      )}
    </div>
  );
}

function Column({ title, tone, items, now }: { title: string; tone: string; items: [string, MistakeEntry][]; now: number }) {
  return (
    <section className={`kcol ${tone}`}>
      <header>
        <span className="kdot" />
        <h3>{title}</h3>
        <span className="kcount">{items.length}</span>
      </header>
      <div className="kitems">
        {items.length === 0 && <p className="kempty">Empty</p>}
        {items.map(([id, m]) => {
          const q = QUESTION_BY_ID[id];
          return (
            <article key={id} className={`kcard ${q.section}`}>
              <div className="kcard-top">
                <span className={`tag sec-${q.section}`}>{SECTION_LABEL[q.section]}</span>
                <span className="kdue">{dueLabel(m.due, now)}</span>
              </div>
              <p className="ktext">{q.passage ?? q.stem}</p>
              <div className="kcard-foot">
                <small>{q.skill}</small>
                <span className="stage-dots" title={`Stage ${m.stage} of ${REVIEW_INTERVALS_DAYS.length}`}>
                  {REVIEW_INTERVALS_DAYS.map((_, i) => <i key={i} className={i < m.stage ? "on" : ""} />)}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
