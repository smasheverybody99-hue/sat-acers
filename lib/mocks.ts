import raw from "@/data/mocks.json";
import { QUESTION_BY_ID, isCorrect } from "./questions";
import type { Question, Section } from "./types";

export interface MockModule {
  section: Section;
  number: number;
  /** Real SAT: R&W is 32 min (27 questions), Math is 35 min (22 questions) */
  minutes: number;
  questionIds: string[];
  /** Module 2 only: the easier version, used when Module 1 goes poorly (adaptive testing) */
  easierQuestionIds?: string[];
}

/** Which version of Module 2 a student gets in each section */
export type Route = "harder" | "easier";
export type Routes = Partial<Record<Section, Route>>;

/** Share of Module 1 that must be correct to be routed to the harder Module 2 */
export const ROUTE_THRESHOLD = 0.55;

export interface Mock {
  id: string;
  title: string;
  description?: string;
  /** The real SAT has a 10-minute break between R&W and Math */
  breakMinutes: number;
  modules: MockModule[];
}

export const MOCKS = raw as unknown as Mock[];
export const MOCK_BY_ID: Record<string, Mock> = Object.fromEntries(MOCKS.map((m) => [m.id, m]));

export function moduleQuestions(m: MockModule, routes?: Routes): Question[] {
  const ids = m.easierQuestionIds && routes?.[m.section] === "easier" ? m.easierQuestionIds : m.questionIds;
  return ids.map((id) => QUESTION_BY_ID[id]).filter(Boolean);
}

export function isAdaptive(mock: Mock): boolean {
  return mock.modules.some((m) => !!m.easierQuestionIds?.length);
}

const answeredRight = (q: Question, answers: Answers) => {
  const a = answers[q.id];
  return a !== undefined && a !== "" && isCorrect(q, a);
};

/** Decide which Module 2 a student gets, based on their Module 1 answers */
export function routeAfter(m: MockModule, answers: Answers): Route {
  const qs = moduleQuestions(m);
  const right = qs.filter((q) => answeredRight(q, answers)).length;
  return qs.length && right / qs.length >= ROUTE_THRESHOLD ? "harder" : "easier";
}

export function mockQuestionCount(mock: Mock): number {
  return mock.modules.reduce((n, m) => n + m.questionIds.length, 0);
}

export function mockMinutes(mock: Mock): number {
  return mock.modules.reduce((n, m) => n + m.minutes, 0);
}

export type Answers = Record<string, number | string>;

export interface SectionResult {
  section: Section;
  correct: number;
  total: number;
  /** Estimated score, 200–800. Only a guide: the real SAT uses a more detailed scoring model. */
  score: number;
  /** Adaptive mocks: which Module 2 the student got */
  route?: Route;
}

export interface DomainResult {
  section: Section;
  domain: string;
  correct: number;
  total: number;
}

export interface MockResult {
  mockId: string;
  finishedAt: number;
  total: number;
  sections: SectionResult[];
  domains: DomainResult[];
  answers: Answers;
  routes?: Routes;
  /** Time spent on each question, in ms */
  times?: Record<string, number>;
}

/**
 * Adaptive estimate. The harder Module 2 unlocks the top of the scale (about 400–800);
 * the easier one tops out a little below 600, like the real test.
 */
export function estimateAdaptiveScore(f1: number, f2: number, route: Route): number {
  const raw = route === "harder" ? 400 + 400 * (0.4 * f1 + 0.6 * f2) : 200 + 450 * (0.4 * f1 + 0.6 * f2);
  return Math.max(200, Math.min(800, Math.round(raw / 10) * 10));
}

export function estimateSectionScore(correct: number, total: number): number {
  if (total === 0) return 200;
  return Math.round((200 + (600 * correct) / total) / 10) * 10;
}

export function scoreMock(mock: Mock, answers: Answers, routes: Routes = {}, times?: Record<string, number>): MockResult {
  const sections = new Map<Section, { correct: number; total: number; byModule: Record<number, [number, number]> }>();
  const domains = new Map<string, DomainResult>();
  const adaptive = isAdaptive(mock);

  for (const mod of mock.modules) {
    for (const q of moduleQuestions(mod, routes)) {
      const ok = answeredRight(q, answers);
      const s = sections.get(q.section) ?? { correct: 0, total: 0, byModule: {} };
      s.total++;
      if (ok) s.correct++;
      const bm = (s.byModule[mod.number] ??= [0, 0]);
      bm[1]++;
      if (ok) bm[0]++;
      sections.set(q.section, s);

      const key = `${q.section}|${q.domain}`;
      const d = domains.get(key) ?? { section: q.section, domain: q.domain, correct: 0, total: 0 };
      d.total++;
      if (ok) d.correct++;
      domains.set(key, d);
    }
  }

  const order: Section[] = ["rw", "math"];
  const sectionResults = order
    .filter((s) => sections.has(s))
    .map((s) => {
      const { correct, total, byModule } = sections.get(s)!;
      const route = routes[s];
      if (adaptive && route && byModule[1] && byModule[2]) {
        const f = (m: [number, number]) => (m[1] ? m[0] / m[1] : 0);
        return { section: s, correct, total, route, score: estimateAdaptiveScore(f(byModule[1]), f(byModule[2]), route) };
      }
      return { section: s, correct, total, score: estimateSectionScore(correct, total) };
    });

  return {
    mockId: mock.id,
    finishedAt: Date.now(),
    total: sectionResults.reduce((n, s) => n + s.score, 0),
    sections: sectionResults,
    domains: [...domains.values()],
    answers,
    routes,
    times,
  };
}
