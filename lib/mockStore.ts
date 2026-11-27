import type { Answers, MockResult } from "./mocks";

/** An in-progress mock; resumes here even after a reload or closing the page */
export interface MockSession {
  mockId: string;
  phase: "module" | "review" | "break";
  moduleIndex: number;
  qIndex: number;
  answers: Answers;
  flagged: Record<string, boolean>;
  /** Chizib tashlangan variantlar (answer eliminator) */
  eliminated?: Record<string, number[]>;
  /** Highlighted ranges in the passage: [start, end] */
  highlights?: Record<string, [number, number][]>;
  /** When the current module or break ends (ms) */
  endsAt: number;
}

const sessionKey = (id: string) => `acers:mock:${id}`;
const HISTORY_KEY = "acers:mockHistory";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* the test continues even if storage is blocked */
  }
}

export const loadSession = (id: string) => read<MockSession | null>(sessionKey(id), null);
export const saveSession = (s: MockSession) => write(sessionKey(s.mockId), s);
export const clearSession = (id: string) => write(sessionKey(id), null);

export const loadHistory = () => read<MockResult[]>(HISTORY_KEY, []);
function notify(fromSync: boolean) {
  try {
    window.dispatchEvent(new CustomEvent("acers:history", { detail: { fromSync } }));
  } catch {
    /* SSR */
  }
}

export function addResult(r: MockResult) {
  write(HISTORY_KEY, [r, ...loadHistory()].slice(0, 50));
  notify(false);
}

/** Bulutdan kelgan tarixni saqlash */
export function saveHistoryRaw(list: MockResult[]) {
  write(HISTORY_KEY, list);
  notify(true);
}
