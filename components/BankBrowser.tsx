"use client";

import { useState } from "react";
import { Icon, type IconName } from "./Icons";
import { useProgress } from "@/lib/useProgress";
import { domainStats, skillStats } from "@/lib/stats";
import { QUESTIONS } from "@/lib/questions";
import { SECTION_LABEL, type Section } from "@/lib/types";

const DOMAIN_ICON: Record<string, IconName> = {
  "Information and Ideas": "sparkle",
  "Craft and Structure": "pen",
  "Expression of Ideas": "globe",
  "Standard English Conventions": "check",
  Algebra: "chart",
  "Advanced Math": "target",
  "Problem-Solving and Data Analysis": "calc",
  "Geometry and Trigonometry": "landmark",
};

const DOMAIN_HINT: Record<string, string> = {
  "Information and Ideas": "Central ideas, evidence, inferences",
  "Craft and Structure": "Word choice, text structure, purpose",
  "Expression of Ideas": "Transitions and rhetorical synthesis",
  "Standard English Conventions": "Grammar and punctuation",
  Algebra: "Linear equations and functions",
  "Advanced Math": "Quadratic, exponential and nonlinear",
  "Problem-Solving and Data Analysis": "Percentages, ratios, statistics",
  "Geometry and Trigonometry": "Shapes, angles, trigonometry",
};

const q = (o: Record<string, string>) => "/practice?" + new URLSearchParams(o).toString();

export function BankBrowser() {
  const progress = useProgress();
  const [tab, setTab] = useState<Section>("rw");
  const stats = domainStats(progress).filter((d) => d.section === tab);
  const count = (s: Section) => QUESTIONS.filter((x) => x.section === s).length;
  const wrongCount = progress ? Object.values(progress.attempts).filter((a) => !a.lastCorrect).length : 0;

  return (
    <div className="bank">
      <div className="page-head">
        <div>
          <h1>Question bank</h1>
          <p>
            {QUESTIONS.length} questions across 8 domains. Pick a topic or practice a mix. Every question comes with a
            step-by-step explanation.
          </p>
        </div>
      </div>

      <div className="quick-row">
        <a className="quick daily" href={q({ daily: "1" })}>
          <span className="quick-ico"><Icon name="flame" /></span>
          <div><b>Daily 5</b><small>Keep your streak going</small></div>
        </a>
        <a className="quick mix" href={q({ section: tab })}>
          <span className="quick-ico"><Icon name="shuffle" /></span>
          <div><b>Mixed: {SECTION_LABEL[tab]}</b><small>Every question in this section</small></div>
        </a>
        <a className={`quick wrong ${wrongCount ? "" : "disabled"}`} href={wrongCount ? q({ status: "wrong" }) : undefined}>
          <span className="quick-ico"><Icon name="repeat" /></span>
          <div><b>Retry missed questions</b><small>{wrongCount} {wrongCount === 1 ? "question" : "questions"}</small></div>
        </a>
      </div>

      <div className="seg big" role="tablist">
        {(["rw", "math"] as Section[]).map((s) => (
          <button key={s} role="tab" aria-selected={tab === s} className={tab === s ? "on" : ""} onClick={() => setTab(s)}>
            {SECTION_LABEL[s]} <span className="seg-count">{count(s)}</span>
          </button>
        ))}
      </div>

      <div className={`domain-grid ${tab}`}>
        {stats.map((d) => {
          const solvedPct = d.total ? Math.round((d.attempted / d.total) * 100) : 0;
          const acc = d.attempted ? Math.round((d.correct / d.attempted) * 100) : null;
          return (
            <article key={d.domain} className="domain-card">
              <header>
                <span className="domain-ico"><Icon name={DOMAIN_ICON[d.domain]} size={22} /></span>
                <div className="domain-title">
                  <h3>{d.domain}</h3>
                  <small>{DOMAIN_HINT[d.domain]}</small>
                </div>
                {acc !== null && <span className={`acc-pill ${acc >= 70 ? "good" : acc >= 40 ? "mid" : "low"}`}>{acc}%</span>}
              </header>

              <div className="domain-progress">
                <div className="bar thin"><i className="solid" style={{ width: `${solvedPct}%` }} /></div>
                <span>{d.attempted}/{d.total} answered</span>
              </div>

              <ul className="skill-list">
                {skillStats(d.domain, progress).map((s) => (
                  <li key={s.skill}>
                    <a href={q({ section: tab, domain: d.domain, skill: s.skill })}>
                      <span className="skill-name">{s.skill}</span>
                      <span className="skill-count">
                        {s.attempted}/{s.total}
                      </span>
                      <Icon name="chevron" size={16} />
                    </a>
                  </li>
                ))}
              </ul>

              <a className="btn btn-light btn-sm domain-go" href={q({ section: tab, domain: d.domain })}>
                Practice this domain
              </a>
            </article>
          );
        })}
      </div>
    </div>
  );
}
