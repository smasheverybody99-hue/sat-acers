"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icons";
import { LogoMark } from "./Logo";
import { useProgress } from "@/lib/useProgress";
import { currentStreak, todayAnswered } from "@/lib/progress";
import { useAuth } from "./AuthProvider";

const NAV: { href: string; label: string; short: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: "home" },
  { href: "/practice", label: "Question bank", short: "Practice", icon: "book" },
  { href: "/mock", label: "Mock tests", short: "Mocks", icon: "clipboard" },
  { href: "/mistakes", label: "Mistake Log", short: "Mistakes", icon: "notebook" },
  { href: "/vocab", label: "Vocabulary", short: "Vocab", icon: "cards" },
  { href: "/progress", label: "Progress", short: "Progress", icon: "trend" },
  { href: "/leaderboard", label: "Leaderboard", short: "Ranks", icon: "podium" },
  { href: "/official", label: "Official resources", short: "Official", icon: "landmark" },
];

/** Mobile tab bar shows the first four; the rest live under "More" */
const TABS = NAV.slice(0, 4);
const MORE = NAV.slice(4);

export const DAILY_GOAL = 5;

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "";
  const progress = useProgress();
  const streak = progress ? currentStreak(progress) : 0;
  const today = progress ? todayAnswered(progress) : 0;
  const due = progress ? Object.values(progress.mistakes).filter((m) => m.due <= Date.now()).length : 0;
  const goalPct = Math.min(100, (today / DAILY_GOAL) * 100);
  const { user, status } = useAuth();
  const isActive = (href: string) => path === href || path.startsWith(href + "/");
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE.some((n) => isActive(n.href));

  return (
    <div className="shell">
      <aside className="side">
        <a href="/" className="side-logo" aria-label="SAT Acers home">
          <LogoMark size={34} />
          <span className="logo-word">
            <small>SAT</small>Acers
          </span>
        </a>

        <nav className="side-nav">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className={isActive(n.href) ? "on" : ""}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
              {n.href === "/mistakes" && due > 0 && <b className="nav-badge">{due}</b>}
            </a>
          ))}
        </nav>

        {status !== "off" && (
          user ? (
            <a href="/login" className="side-user">
              <span className="avatar">{(user.name || user.email || "?")[0].toUpperCase()}</span>
              <div>
                <b>{user.name || user.email}</b>
                <small className={`sync-dot ${status}`}>
                  <i /> {status === "synced" ? "Synced" : status === "syncing" ? "Syncing…" : "Sync error"}
                </small>
              </div>
            </a>
          ) : (
            <a href="/login" className="side-login">
              <Icon name="sparkle" size={18} />
              <div>
                <b>Save your progress</b>
                <small>Sign in to sync across your phone and computer</small>
              </div>
            </a>
          )
        )}

        <div className="side-streak">
          <div className="side-streak-top">
            <span className={`flame ${streak ? "lit" : ""}`}>
              <Icon name="flame" size={22} />
            </span>
            <div>
              <b>{streak} {streak === 1 ? "day" : "days"}</b>
              <small>{streak ? "practice streak" : "start your streak"}</small>
            </div>
          </div>
          <div className="goal-label">
            <span>Today's goal</span>
            <span>
              {Math.min(today, DAILY_GOAL)}/{DAILY_GOAL}
            </span>
          </div>
          <div className="goal-bar">
            <i style={{ width: `${goalPct}%` }} />
          </div>
        </div>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <a href="/dashboard" className="side-logo">
            <LogoMark size={30} />
            <span className="logo-word">
              <small>SAT</small>Acers
            </span>
          </a>
          <div className="topbar-right">
            <span className={`streak-badge ${streak ? "" : "off"}`}>
              <Icon name="flame" size={16} /> {streak}
            </span>
            {status !== "off" && (
              <a href="/login" className="avatar sm" aria-label={user ? "Account" : "Sign in"}>
                {user ? (user.name || user.email || "?")[0].toUpperCase() : <Icon name="sparkle" size={16} />}
              </a>
            )}
          </div>
        </header>
        <main className="shell-content">{children}</main>
      </div>

      {moreOpen && (
        <div className="more-sheet" onClick={() => setMoreOpen(false)}>
          <nav aria-label="More pages" onClick={(e) => e.stopPropagation()}>
            {MORE.map((n) => (
              <a key={n.href} href={n.href} className={isActive(n.href) ? "on" : ""}>
                <Icon name={n.icon} size={22} />
                <span>{n.label}</span>
              </a>
            ))}
          </nav>
        </div>
      )}

      <nav className="tabbar" aria-label="Main menu">
        {TABS.map((n) => (
          <a key={n.href} href={n.href} className={isActive(n.href) ? "on" : ""}>
            <Icon name={n.icon} size={22} />
            <span>{n.short}</span>
            {n.href === "/mistakes" && due > 0 && <b className="nav-badge">{due}</b>}
          </a>
        ))}
        <button className={moreActive || moreOpen ? "on" : ""} onClick={() => setMoreOpen((o) => !o)} aria-expanded={moreOpen}>
          <Icon name="dots" size={22} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
