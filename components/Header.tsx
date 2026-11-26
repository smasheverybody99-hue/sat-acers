"use client";

import { Logo } from "./Logo";
import { useProgress } from "@/lib/useProgress";
import { currentStreak } from "@/lib/progress";

export function Header() {
  const progress = useProgress();
  const streak = progress ? currentStreak(progress) : 0;

  return (
    <header className="header">
      <div className="container header-inner">
        <Logo />
        <nav className="nav">
          <a href="/practice" title="Question bank">🎯 <span className="nav-label">Question bank</span></a>
          <a href="/mock" title="Mock test">📝 <span className="nav-label">Mock test</span></a>
          <a href="/mistakes" title="Xatonoma">📒 <span className="nav-label">Xatonoma</span></a>
          <a href="/official" title="Rasmiy resurslar">🏛 <span className="nav-label">Rasmiy</span></a>
          <span
            className={`streak-badge ${streak ? "" : "off"}`}
            title={streak ? `${streak} kun ketma-ket mashq qildingiz` : "Bugun bitta savol yeching — streak boshlanadi"}
          >
            🔥 {streak}
          </span>
        </nav>
      </div>
    </header>
  );
}
