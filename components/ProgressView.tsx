"use client";

import { useEffect, useMemo, useState } from "react";
import { loadHistory } from "@/lib/mockStore";
import { MOCK_BY_ID, type MockResult } from "@/lib/mocks";
import { QUESTION_BY_ID } from "@/lib/questions";
import { useProgress } from "@/lib/useProgress";
import { totalAnswered } from "@/lib/progress";
import { shortDate } from "@/lib/format";
import { DOMAINS, SECTION_LABEL, type Section } from "@/lib/types";
import { Icon } from "./Icons";
import { PACE_SEC, fmtSec } from "./MockResults";

interface TimeStat {
  key: string;
  section: Section;
  domain: string;
  skill?: string;
  avgMs: number;
  timed: number;
  accuracy: number;
}

function paceLabel(ratio: number): { cls: string; text: string } {
  if (ratio <= 1) return { cls: "good", text: "On pace" };
  if (ratio <= 1.25) return { cls: "mid", text: "A bit slow" };
  return { cls: "low", text: "Slow" };
}

export function ProgressView() {
  const progress = useProgress();
  const [history, setHistory] = useState<MockResult[]>([]);

  useEffect(() => {
    const update = () => setHistory(loadHistory());
    update();
    window.addEventListener("acers:history", update);
    return () => window.removeEventListener("acers:history", update);
  }, []);

  const runs = useMemo(() => [...history].sort((a, b) => a.finishedAt - b.finishedAt), [history]);

  const { domainStats, skillStats, avgAll } = useMemo(() => {
    const byDomain = new Map<string, { s: Section; d: string; ms: number; n: number; ok: number }>();
    const bySkill = new Map<string, { s: Section; d: string; k: string; ms: number; n: number; ok: number }>();
    let total = 0;
    let count = 0;
    for (const [id, a] of Object.entries(progress?.attempts ?? {})) {
      const q = QUESTION_BY_ID[id];
      if (!q || !a.ms) continue;
      total += a.ms;
      count++;
      const d = byDomain.get(q.domain) ?? { s: q.section, d: q.domain, ms: 0, n: 0, ok: 0 };
      d.ms += a.ms;
      d.n++;
      if (a.lastCorrect) d.ok++;
      byDomain.set(q.domain, d);
      const k = bySkill.get(q.skill) ?? { s: q.section, d: q.domain, k: q.skill, ms: 0, n: 0, ok: 0 };
      k.ms += a.ms;
      k.n++;
      if (a.lastCorrect) k.ok++;
      bySkill.set(q.skill, k);
    }
    const domainStats: TimeStat[] = (["rw", "math"] as const).flatMap((s) =>
      DOMAINS[s].map((domain) => {
        const x = byDomain.get(domain);
        return { key: domain, section: s, domain, avgMs: x ? x.ms / x.n : 0, timed: x?.n ?? 0, accuracy: x ? x.ok / x.n : 0 };
      })
    );
    const skillStats: TimeStat[] = [...bySkill.values()]
      .filter((x) => x.n >= 2)
      .map((x) => ({ key: x.k, section: x.s, domain: x.d, skill: x.k, avgMs: x.ms / x.n, timed: x.n, accuracy: x.ok / x.n }))
      .sort((a, b) => b.avgMs / (PACE_SEC[b.section] * 1000) - a.avgMs / (PACE_SEC[a.section] * 1000))
      .slice(0, 5);
    return { domainStats, skillStats, avgAll: count ? total / count : 0 };
  }, [progress]);

  const latest = runs[runs.length - 1];
  const best = runs.length ? Math.max(...runs.map((r) => r.total)) : null;
  const change = runs.length >= 2 ? latest.total - runs[0].total : null;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Progress</h1>
          <p>How your mock scores are changing and where your time goes.</p>
        </div>
      </div>

      <div className="pv-tiles">
        <div className="tile-card pv-tile">
          <span>Latest score</span>
          <b>{latest ? latest.total : "—"}</b>
          <small>{latest ? shortDate(latest.finishedAt) : "No mocks yet"}</small>
        </div>
        <div className="tile-card pv-tile">
          <span>Best score</span>
          <b>{best ?? "—"}</b>
          <small>{runs.length} {runs.length === 1 ? "mock" : "mocks"} taken</small>
        </div>
        <div className="tile-card pv-tile">
          <span>Change since first mock</span>
          <b className={change === null ? "" : change >= 0 ? "up" : "down"}>
            {change === null ? "—" : `${change >= 0 ? "+" : "−"}${Math.abs(change)}`}
          </b>
          <small>{change === null ? "Take 2 mocks to compare" : "points"}</small>
        </div>
        <div className="tile-card pv-tile">
          <span>Average time per question</span>
          <b>{avgAll ? fmtSec(avgAll) : "—"}</b>
          <small>{progress ? `${totalAnswered(progress)} questions answered` : ""}</small>
        </div>
      </div>

      <section className="tile-card pv-section">
        <div className="card-label"><Icon name="trend" size={18} /> Mock score history</div>
        {runs.length ? (
          <>
            <ScoreChart runs={runs} />
            <table className="pv-table">
              <thead>
                <tr><th>Date</th><th>Mock</th><th>Reading &amp; Writing</th><th>Math</th><th>Total</th></tr>
              </thead>
              <tbody>
                {[...runs].reverse().map((r) => {
                  const sec = (s: Section) => r.sections.find((x) => x.section === s);
                  const cell = (s: Section) => {
                    const x = sec(s);
                    if (!x) return "—";
                    return (
                      <>
                        {x.score}
                        {x.route && <span className={`route-dot ${x.route}`} title={`Module 2: ${x.route}`}>{x.route === "harder" ? "▲" : "▼"}</span>}
                      </>
                    );
                  };
                  return (
                    <tr key={r.finishedAt}>
                      <td>{shortDate(r.finishedAt)}</td>
                      <td>{MOCK_BY_ID[r.mockId]?.title.replace("SAT Acers ", "") ?? r.mockId}</td>
                      <td>{cell("rw")}</td>
                      <td>{cell("math")}</td>
                      <td><b>{r.total}</b></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="pv-hint">▲ harder Module 2 · ▼ easier Module 2</p>
          </>
        ) : (
          <div className="pv-empty">
            <p>Your score chart appears after your first mock test.</p>
            <a className="btn btn-primary" href="/mock">Take a mock</a>
          </div>
        )}
      </section>

      <section className="tile-card pv-section">
        <div className="card-label"><Icon name="clock" size={18} /> Time per question by domain</div>
        <p className="pv-sub">
          Target pace on the real SAT: {fmtSec(PACE_SEC.rw * 1000)} per Reading &amp; Writing question and{" "}
          {fmtSec(PACE_SEC.math * 1000)} per Math question. The line on each bar marks the target.
        </p>
        <div className="pv-bars">
          {(["rw", "math"] as const).map((s) => (
            <div key={s} className="pv-bar-group">
              <h3>{SECTION_LABEL[s]}</h3>
              {domainStats
                .filter((d) => d.section === s)
                .map((d) => {
                  const pace = PACE_SEC[s] * 1000;
                  const ratio = d.avgMs / pace;
                  const p = paceLabel(ratio);
                  return (
                    <div key={d.key} className="pv-bar-row" title={d.timed ? `${d.timed} timed answers · ${Math.round(d.accuracy * 100)}% correct` : "No timed answers yet"}>
                      <span className="pv-bar-name">{d.domain}</span>
                      <div className="pv-track">
                        {d.timed > 0 && <i className={p.cls} style={{ width: `${Math.min(100, ratio * 50)}%` }} />}
                        <em className="pv-target" />
                      </div>
                      <span className="pv-bar-val">
                        {d.timed ? (
                          <>
                            <b>{fmtSec(d.avgMs)}</b> <small className={p.cls}>{p.text}</small>
                          </>
                        ) : (
                          <small>No data</small>
                        )}
                      </span>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </section>

      <section className="tile-card pv-section">
        <div className="card-label"><Icon name="target" size={18} /> Skills that take you longest</div>
        {skillStats.length ? (
          <div className="pv-skills">
            {skillStats.map((k) => {
              const ratio = k.avgMs / (PACE_SEC[k.section] * 1000);
              const p = paceLabel(ratio);
              const href = `/practice?section=${k.section}&domain=${encodeURIComponent(k.domain)}&skill=${encodeURIComponent(k.skill!)}`;
              return (
                <a key={k.key} className="pv-skill" href={href}>
                  <div>
                    <b>{k.skill}</b>
                    <small>{k.domain} · {Math.round(k.accuracy * 100)}% correct · {k.timed} timed</small>
                  </div>
                  <span><b>{fmtSec(k.avgMs)}</b> <small className={p.cls}>{p.text}</small></span>
                  <Icon name="chevron" size={18} />
                </a>
              );
            })}
          </div>
        ) : (
          <p className="pv-sub">Answer a few more questions in the question bank or a mock, and your slowest skills will show up here.</p>
        )}
      </section>
    </div>
  );
}

/* Single-series line chart: total score per mock, oldest to newest. */
function ScoreChart({ runs }: { runs: MockResult[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 260;
  const pad = { l: 46, r: 18, t: 18, b: 34 };
  const scores = runs.map((r) => r.total);
  const lo = Math.max(400, Math.floor((Math.min(...scores) - 100) / 100) * 100);
  const hi = Math.min(1600, Math.ceil((Math.max(...scores) + 100) / 100) * 100);
  const x = (i: number) => (runs.length === 1 ? (pad.l + W - pad.r) / 2 : pad.l + (i * (W - pad.l - pad.r)) / (runs.length - 1));
  const y = (v: number) => pad.t + ((hi - v) * (H - pad.t - pad.b)) / (hi - lo);
  const step = hi - lo > 600 ? 200 : 100;
  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += step) ticks.push(v);
  const path = runs.map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(r.total).toFixed(1)}`).join(" ");
  const h = hover !== null ? runs[hover] : null;

  return (
    <div className="pv-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Total mock scores: ${scores.join(", ")}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="pv-grid" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="pv-axis">{t}</text>
          </g>
        ))}
        {runs.map((r, i) => (
          <text key={r.finishedAt} x={x(i)} y={H - 10} textAnchor="middle" className="pv-axis">
            {runs.length <= 8 || i % Math.ceil(runs.length / 8) === 0 ? shortDate(r.finishedAt) : ""}
          </text>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} className="pv-cross" />}
        <path d={path} className="pv-line" />
        {runs.map((r, i) => (
          <circle key={r.finishedAt} cx={x(i)} cy={y(r.total)} r={hover === i ? 6 : 4.5} className="pv-dot" />
        ))}
        {runs.length > 0 && (
          <text x={x(runs.length - 1)} y={y(runs[runs.length - 1].total) - 12} textAnchor={runs.length === 1 ? "middle" : "end"} className="pv-label">
            {runs[runs.length - 1].total}
          </text>
        )}
        {runs.map((r, i) => {
          const half = runs.length === 1 ? W / 2 : (W - pad.l - pad.r) / (runs.length - 1) / 2;
          return (
            <rect
              key={r.finishedAt}
              x={x(i) - half}
              y={0}
              width={half * 2}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onTouchStart={() => setHover(i)}
            />
          );
        })}
      </svg>
      {h && hover !== null && (
        <div className="pv-tip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(h.total) / H) * 100}%` }}>
          <b>{h.total}</b>
          <span>{MOCK_BY_ID[h.mockId]?.title ?? h.mockId}</span>
          {h.sections.map((s) => (
            <span key={s.section}>{SECTION_LABEL[s.section]}: {s.score}</span>
          ))}
          <small>{shortDate(h.finishedAt)}</small>
        </div>
      )}
    </div>
  );
}
