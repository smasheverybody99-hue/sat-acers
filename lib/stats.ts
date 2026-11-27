import { QUESTIONS } from "./questions";
import { DOMAINS, type Section } from "./types";
import type { Progress } from "./progress";

export interface DomainStat {
  section: Section;
  domain: string;
  total: number;
  attempted: number;
  correct: number;
}

export interface SkillStat {
  skill: string;
  total: number;
  attempted: number;
}

/** Per domain: total questions, answered, and correct (latest attempt) */
export function domainStats(p: Progress | null): DomainStat[] {
  const out: DomainStat[] = [];
  for (const section of ["rw", "math"] as Section[]) {
    for (const domain of DOMAINS[section]) {
      const qs = QUESTIONS.filter((q) => q.domain === domain);
      const tried = p ? qs.filter((q) => p.attempts[q.id]) : [];
      out.push({
        section,
        domain,
        total: qs.length,
        attempted: tried.length,
        correct: p ? tried.filter((q) => p.attempts[q.id].lastCorrect).length : 0,
      });
    }
  }
  return out;
}

export function skillStats(domain: string, p: Progress | null): SkillStat[] {
  const map = new Map<string, SkillStat>();
  for (const q of QUESTIONS) {
    if (q.domain !== domain) continue;
    const s = map.get(q.skill) ?? { skill: q.skill, total: 0, attempted: 0 };
    s.total++;
    if (p?.attempts[q.id]) s.attempted++;
    map.set(q.skill, s);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function overall(p: Progress | null) {
  const attempts = p ? Object.values(p.attempts) : [];
  const solved = attempts.length;
  const correct = attempts.filter((a) => a.lastCorrect).length;
  return { solved, correct, accuracy: solved ? Math.round((correct / solved) * 100) : 0 };
}

/** Stable daily "random" pick: the same 5 questions for everyone on a given day */
export function dailyIds(p: Progress | null, day: string, n = 5): string[] {
  let seed = [...day].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const pool = QUESTIONS.filter((q) => !p?.attempts[q.id]);
  const source = pool.length >= n ? pool : QUESTIONS;
  const arr = [...source];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n).map((q) => q.id);
}
