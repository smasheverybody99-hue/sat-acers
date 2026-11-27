"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icons";
import { MOCKS, mockMinutes, mockQuestionCount } from "@/lib/mocks";
import { loadHistory, loadSession } from "@/lib/mockStore";

interface Status {
  best?: number;
  attempts: number;
  inProgress: boolean;
}

function fmtTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} hr ${m} min` : `${m} min`;
}

export function MockList() {
  const [status, setStatus] = useState<Record<string, Status>>({});

  useEffect(() => {
    const hist = loadHistory();
    const s: Record<string, Status> = {};
    for (const m of MOCKS) {
      const mine = hist.filter((r) => r.mockId === m.id);
      s[m.id] = {
        best: mine.length ? Math.max(...mine.map((r) => r.total)) : undefined,
        attempts: mine.length,
        inProgress: Boolean(loadSession(m.id)),
      };
    }
    setStatus(s);
  }, []);

  const full = MOCKS.filter((m) => !m.id.startsWith("demo"));
  const demo = MOCKS.filter((m) => m.id.startsWith("demo"));

  return (
    <div className="mocks">
      <div className="page-head">
        <div>
          <h1>Mock tests</h1>
          <p>In the Bluebook format: 4 modules, a real timer, a 10-minute break, Desmos, and a breakdown by domain at the end.</p>
        </div>
      </div>

      <div className="mock-grid">
        {full.map((m, i) => {
          const st = status[m.id];
          return (
            <a key={m.id} href={`/mock/${m.id}`} className={`mock-card v${(i % 5) + 1}`}>
              <div className="mock-art">
                <span className="mock-no">#{i + 1}</span>
                {st?.inProgress && <span className="mock-flag live">In progress</span>}
                {!st?.inProgress && st?.best !== undefined && <span className="mock-flag done">Best: {st.best}</span>}
              </div>
              <div className="mock-body">
                <h3>{m.title}</h3>
                <div className="mock-meta">
                  <span><Icon name="book" size={15} /> {mockQuestionCount(m)} questions</span>
                  <span><Icon name="clock" size={15} /> {fmtTime(mockMinutes(m))}</span>
                </div>
                <div className="mock-sections">
                  <span className="sec rw">R&W · 2 × 27</span>
                  <span className="sec math">Math · 2 × 22</span>
                </div>
                <span className="mock-cta">
                  {st?.inProgress ? "Resume" : st?.attempts ? "Retake" : "Start"} <Icon name="arrowRight" size={16} />
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {demo.length > 0 && (
        <>
          <h2 className="sub-h">Quick try</h2>
          <div className="mock-grid">
            {demo.map((m) => (
              <a key={m.id} href={`/mock/${m.id}`} className="mock-card mini">
                <div className="mock-body">
                  <h3>{m.title}</h3>
                  <p className="muted-s">{m.description}</p>
                  <div className="mock-meta">
                    <span><Icon name="book" size={15} /> {mockQuestionCount(m)} questions</span>
                    <span><Icon name="clock" size={15} /> {fmtTime(mockMinutes(m))}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
