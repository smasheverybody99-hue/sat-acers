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
          <a href="/practice">Question bank</a>
          <a href="/mistakes" className="hide-sm">Xatonoma</a>
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
