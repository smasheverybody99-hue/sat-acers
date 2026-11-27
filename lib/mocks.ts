import raw from "@/data/mocks.json";
import { QUESTION_BY_ID, isCorrect } from "./questions";
import type { Question, Section } from "./types";

export interface MockModule {
  section: Section;
  number: number;
  /** Real SAT: R&W is 32 min (27 questions), Math is 35 min (22 questions) */
  minutes: number;
  questionIds: string[];
}

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

export function moduleQuestions(m: MockModule): Question[] {
  return m.questionIds.map((id) => QUESTION_BY_ID[id]).filter(Boolean);
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
  /** Estimated score, 200–800. The real SAT is adaptive, so this is only a guide. */
  score: number;
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
}

export function estimateSectionScore(correct: number, total: number): number {
  if (total === 0) return 200;
  return Math.round((200 + (600 * correct) / total) / 10) * 10;
}

export function scoreMock(mock: Mock, answers: Answers): MockResult {
  const sections = new Map<Section, { correct: number; total: number }>();
  const domains = new Map<string, DomainResult>();

  for (const mod of mock.modules) {
    for (const q of moduleQuestions(mod)) {
      const a = answers[q.id];
      const ok = a !== undefined && a !== "" && isCorrect(q, a);
      const s = sections.get(q.section) ?? { correct: 0, total: 0 };
      s.total++;
      if (ok) s.correct++;
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
      const { correct, total } = sections.get(s)!;
      return { section: s, correct, total, score: estimateSectionScore(correct, total) };
    });

  return {
    mockId: mock.id,
    finishedAt: Date.now(),
    total: sectionResults.reduce((n, s) => n + s.score, 0),
    sections: sectionResults,
    domains: [...domains.values()],
    answers,
  };
}
