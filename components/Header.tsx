"use client";

import { Logo } from "./Logo";
import { Icon } from "./Icons";
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
          <a href="/practice" className="hide-sm">Question bank</a>
          <a href="/mock" className="hide-sm">Mock testlar</a>
          <a href="/official" className="hide-sm">Rasmiy</a>
          {streak > 0 && (
            <span className="streak-badge">
              <Icon name="flame" size={16} /> {streak}
            </span>
          )}
          <a href="/dashboard" className="btn btn-primary btn-sm nav-cta">
            Bosh panel
          </a>
        </nav>
      </div>
    </header>
  );
}
