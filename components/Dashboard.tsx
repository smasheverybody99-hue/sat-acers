"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icons";
import { Ring } from "./Ring";
import { DAILY_GOAL } from "./AppShell";
import { useProgress } from "@/lib/useProgress";
import { currentStreak, dayKey, todayAnswered } from "@/lib/progress";
import { domainStats, overall } from "@/lib/stats";
import { loadHistory } from "@/lib/mockStore";
import { MOCK_BY_ID, type MockResult } from "@/lib/mocks";
import { SECTION_LABEL } from "@/lib/types";
import { uzDate, uzDateLong } from "@/lib/format";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Xayrli tun";
  if (h < 12) return "Xayrli tong";
  if (h < 18) return "Xayrli kun";
  return "Xayrli kech";
}

export function Dashboard() {
  const progress = useProgress();
  const [history, setHistory] = useState<MockResult[]>([]);
  useEffect(() => setHistory(loadHistory()), []);

  if (!progress) return null;

  const streak = currentStreak(progress);
  const today = todayAnswered(progress);
  const { solved, accuracy } = overall(progress);
  const due = Object.values(progress.mistakes).filter((m) => m.due <= Date.now()).length;
  const totalMistakes = Object.keys(progress.mistakes).length;
  const stats = domainStats(progress);
  const latest = history[0];
  const est = latest ? latest.total : solved >= 10 ? Math.round((400 + (accuracy / 100) * 1200) / 10) * 10 : null;
  const goalDone = today >= DAILY_GOAL;

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1>{greeting()}! 👋</h1>
          <p>
            {uzDateLong(Date.now())} ·{" "}
            {goalDone ? "Bugungi maqsad bajarildi" : `Bugun yana ${DAILY_GOAL - today} ta savol qoldi`}
          </p>
        </div>
        <a className="btn btn-primary" href="/practice?daily=1">
          <Icon name="play" size={16} /> Kunlik 5 savol
        </a>
      </div>

      <div className="dash-grid">
        {/* Ball */}
        <section className="tile-card score-card">
          <div className="card-label">
            <Icon name="target" size={18} /> Taxminiy ball
          </div>
          <div className="score-card-body">
            <Ring value={est ? (est - 400) / 1200 : 0} size={150} stroke={12} id="ring-score">
              <b className="ring-num">{est ?? "—"}</b>
              <small>/ 1600</small>
            </Ring>
            <div className="score-card-side">
              {latest ? (
                <>
                  <p className="muted-s">Oxirgi mock: {MOCK_BY_ID[latest.mockId]?.title ?? "Mock"}</p>
                  {latest.sections.map((s) => (
                    <div key={s.section} className="mini-score">
                      <span>{SECTION_LABEL[s.section]}</span>
                      <b>{s.score}</b>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p className="muted-s">
                    {est ? "Yechgan savollaringiz asosida hisoblandi." : "Ballni bilish uchun mock topshiring yoki 10 ta savol yeching."}
                  </p>
                  <a className="btn btn-ghost btn-sm" href="/mock">
                    Mock topshirish
                  </a>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Streak */}
        <section className="tile-card streak-card">
          <div className="card-label">
            <Icon name="flame" size={18} /> Streak
          </div>
          <div className="streak-big">
            <span className={`flame xl ${streak ? "lit" : ""}`}>
              <Icon name="flame" size={44} />
            </span>
            <b>{streak}</b>
            <small>kun ketma-ket</small>
          </div>
          <WeekDots progressDay={progress.streak.lastDay} streak={streak} />
        </section>

        {/* Kunlik maqsad */}
        <section className="tile-card goal-card">
          <div className="card-label">
            <Icon name="check" size={18} /> Bugungi maqsad
          </div>
          <Ring value={today / DAILY_GOAL} size={118} stroke={11} from="#3ddc97" to="#4c7dff" id="ring-goal">
            <b className="ring-num sm">
              {Math.min(today, DAILY_GOAL)}/{DAILY_GOAL}
            </b>
          </Ring>
          <p className="muted-s center">{goalDone ? "Barakalla! 🎉" : "savol yechildi"}</p>
        </section>

        {/* Statistika */}
        <section className="tile-card stats-card">
          <div className="card-label">
            <Icon name="chart" size={18} /> Statistika
          </div>
          <div className="stat-rows">
            <div><span>Yechilgan</span><b>{solved}</b></div>
            <div><span>Aniqlik</span><b>{accuracy}%</b></div>
            <div><span>Mocklar</span><b>{history.length}</b></div>
          </div>
        </section>

        {/* Xatonoma */}
        <a href="/mistakes" className={`tile-card due-card ${due ? "hot" : ""}`}>
          <div className="card-label">
            <Icon name="notebook" size={18} /> Xatonoma
          </div>
          <b className="due-num">{due}</b>
          <p>{due ? "ta savolni bugun takrorlash kerak" : totalMistakes ? "Bugun takrorlash yo'q — ertaga qaytadi" : "Hali xato yo'q. Zo'r!"}</p>
          <span className="card-link">
            Ochish <Icon name="arrowRight" size={16} />
          </span>
        </a>

        {/* Oxirgi mocklar */}
        <section className="tile-card recent-card">
          <div className="card-head-row">
            <div className="card-label">
              <Icon name="trophy" size={18} /> Oxirgi mocklar
            </div>
            <a className="card-link" href="/mock">
              Barchasi <Icon name="arrowRight" size={16} />
            </a>
          </div>
          {history.length === 0 ? (
            <div className="recent-empty">
              <p>Hali mock topshirilmagan. Birinchisi bilan boshlang va zaif joylaringizni bilib oling.</p>
              <a className="btn btn-navy btn-sm" href="/mock/acers-1">
                Mock #1 ni boshlash
              </a>
            </div>
          ) : (
            <div className="recent-list">
              {history.slice(0, 4).map((r) => (
                <div key={r.finishedAt} className="recent-row">
                  <div>
                    <b>{MOCK_BY_ID[r.mockId]?.title ?? "Mock"}</b>
                    <small>{uzDate(r.finishedAt)}</small>
                  </div>
                  <span className="recent-score">{r.total}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Domenlar */}
        <section className="tile-card mastery-card">
          <div className="card-head-row">
            <div className="card-label">
              <Icon name="sparkle" size={18} /> Domenlar bo'yicha o'zlashtirish
            </div>
            <a className="card-link" href="/practice">
              Question bank <Icon name="arrowRight" size={16} />
            </a>
          </div>
          <div className="mastery-cols">
            {(["rw", "math"] as const).map((sec) => (
              <div key={sec} className={`mastery-col ${sec}`}>
                <h4>{SECTION_LABEL[sec]}</h4>
                {stats
                  .filter((d) => d.section === sec)
                  .map((d) => {
                    const pct = d.attempted ? Math.round((d.correct / d.attempted) * 100) : 0;
                    return (
                      <a
                        key={d.domain}
                        className="mastery-row"
                        href={`/practice?section=${sec}&domain=${encodeURIComponent(d.domain)}`}
                      >
                        <div className="mastery-name">
                          <span>{d.domain}</span>
                          <small>
                            {d.attempted}/{d.total} yechildi
                          </small>
                        </div>
                        <div className="bar">
                          <i
                            className={!d.attempted ? "" : pct >= 70 ? "good" : pct >= 40 ? "mid" : "low"}
                            style={{ width: `${d.attempted ? Math.max(pct, 4) : 0}%` }}
                          />
                        </div>
                        <b>{d.attempted ? `${pct}%` : "—"}</b>
                      </a>
                    );
                  })}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

function WeekDots({ progressDay, streak }: { progressDay: string | null; streak: number }) {
  // Oxirgi 7 kun: streak davomidagi kunlar yonadi
  const days: { label: string; on: boolean; today: boolean }[] = [];
  const names = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
  const now = Date.now();
  const last = progressDay;
  for (let i = 6; i >= 0; i--) {
    const t = now - i * 86400000;
    const key = dayKey(t);
    let on = false;
    if (streak && last) {
      const lastT = new Date(last + "T12:00:00").getTime();
      const diff = Math.round((lastT - new Date(key + "T12:00:00").getTime()) / 86400000);
      on = diff >= 0 && diff < streak;
    }
    days.push({ label: names[new Date(t).getDay()], on, today: i === 0 });
  }
  return (
    <div className="week-dots">
      {days.map((d, i) => (
        <span key={i} className={`${d.on ? "on" : ""} ${d.today ? "today" : ""}`}>
          <i />
          {d.label}
        </span>
      ))}
    </div>
  );
}
