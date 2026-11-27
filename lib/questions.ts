import raw from "@/data/questions.json";
import type { Question } from "./types";

export const QUESTIONS = raw as unknown as Question[];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q])
);

/** Normalizes SPR answers: handles spaces, unicode minus, and equivalents like 0.50 = .5 */
export function normalizeAnswer(value: string): string {
  const s = value.trim().replace(/−/g, "-").replace(/\s+/g, "");
  if (/^-?\d*\.?\d+$/.test(s)) return String(Number(s));
  const frac = s.match(/^(-?\d+)\/(\d+)$/);
  if (frac && Number(frac[2]) !== 0) {
    return String(Number(frac[1]) / Number(frac[2]));
  }
  return s.toLowerCase();
}

export function isCorrect(q: Question, response: number | string): boolean {
  if (q.type === "mcq") return response === q.answer;
  const accepted = (q.answer as string[]).map(normalizeAnswer);
  return accepted.includes(normalizeAnswer(String(response)));
}

export function correctAnswerLabel(q: Question): string {
  if (q.type === "mcq") return String.fromCharCode(65 + (q.answer as number));
  return (q.answer as string[])[0];
}
