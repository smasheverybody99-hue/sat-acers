/**
 * Progress is stored in the browser's localStorage.
 * Cloud sync (lib/sync.ts) builds on these functions; pages don't need to change.
 */

const KEY = "acers:v1";
const DAY = 24 * 60 * 60 * 1000;
/** Mistake Log: a missed question comes back after 1, 3 and 7 days */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7];

export interface AttemptStat {
  tries: number;
  correct: number;
  lastCorrect: boolean;
  lastAt: number;
  /** Time spent on the latest attempt, in ms (when measured) */
  ms?: number;
}

export interface MistakeEntry {
  /** 0..2 — which review stage the question is at */
  stage: number;
  due: number;
  addedAt: number;
}

export interface Progress {
  attempts: Record<string, AttemptStat>;
  mistakes: Record<string, MistakeEntry>;
  streak: { count: number; lastDay: string | null };
  daily: { day: string | null; answered: number };
  /** Questions answered per day ("YYYY-MM-DD" → count) */
  days: Record<string, number>;
}

const empty = (): Progress => ({
  attempts: {},
  mistakes: {},
  streak: { count: 0, lastDay: null },
  daily: { day: null, answered: 0 },
  days: {},
});

export function dayKey(ts = Date.now()): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

function save(p: Progress, fromSync = false) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent("acers:progress", { detail: { fromSync } }));
  } catch {
    /* the site keeps working even if storage is blocked */
  }
}

/** Streak: kept if you practiced today, continues if you practiced yesterday, otherwise resets */
export function currentStreak(p: Progress, now = Date.now()): number {
  const { lastDay, count } = p.streak;
  if (!lastDay) return 0;
  if (lastDay === dayKey(now) || lastDay === dayKey(now - DAY)) return count;
  return 0;
}

export function todayAnswered(p: Progress, now = Date.now()): number {
  return p.daily.day === dayKey(now) ? p.daily.answered : 0;
}

/** Monday of the week containing `ts`, as a day key */
export function weekKey(ts = Date.now()): string {
  const d = new Date(ts);
  const back = (d.getDay() + 6) % 7;
  return dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - back).getTime());
}

/** Questions answered in the current week (Monday–Sunday) */
export function weekAnswered(p: Progress, now = Date.now()): number {
  const start = weekKey(now);
  return Object.entries(p.days ?? {}).reduce((n, [day, c]) => (day >= start && day <= dayKey(now) ? n + c : n), 0);
}

export function totalAnswered(p: Progress): number {
  return Object.values(p.attempts).reduce((n, a) => n + a.tries, 0);
}

export function recordAnswer(questionId: string, correct: boolean, ms?: number, now = Date.now()): Progress {
  const p = loadProgress();
  const today = dayKey(now);

  const prev = p.attempts[questionId];
  p.attempts[questionId] = {
    tries: (prev?.tries ?? 0) + 1,
    correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
    lastCorrect: correct,
    lastAt: now,
    ...(ms && ms > 0 ? { ms: Math.round(ms) } : {}),
  };

  // Mistake Log
  const m = p.mistakes[questionId];
  if (!correct) {
    p.mistakes[questionId] = {
      stage: 0,
      due: now + REVIEW_INTERVALS_DAYS[0] * DAY,
      addedAt: m?.addedAt ?? now,
    };
  } else if (m && m.due <= now) {
    const next = m.stage + 1;
    if (next >= REVIEW_INTERVALS_DAYS.length) {
      delete p.mistakes[questionId]; // mastered 🎉
    } else {
      p.mistakes[questionId] = { ...m, stage: next, due: now + REVIEW_INTERVALS_DAYS[next] * DAY };
    }
  }

  // Streak
  if (p.streak.lastDay !== today) {
    const continued = p.streak.lastDay === dayKey(now - DAY);
    p.streak = { count: continued ? p.streak.count + 1 : 1, lastDay: today };
  }

  // Daily count
  p.daily = p.daily.day === today ? { day: today, answered: p.daily.answered + 1 } : { day: today, answered: 1 };
  p.days = { ...(p.days ?? {}), [today]: (p.days?.[today] ?? 0) + 1 };

  save(p);
  return p;
}

/** Save data that came from the cloud (doesn't trigger another push) */
export function saveProgressRaw(p: Progress) {
  save(p, true);
}

export function resetProgress() {
  save(empty());
}
