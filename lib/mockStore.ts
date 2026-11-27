import type { Answers, MockResult } from "./mocks";

/** Davom etayotgan mock — sahifa yangilansa yoki yopilsa ham shu yerdan davom etadi */
export interface MockSession {
  mockId: string;
  phase: "module" | "review" | "break";
  moduleIndex: number;
  qIndex: number;
  answers: Answers;
  flagged: Record<string, boolean>;
  /** Chizib tashlangan variantlar (answer eliminator) */
  eliminated?: Record<string, number[]>;
  /** Matndagi bo'yalgan joylar: [boshi, oxiri] */
  highlights?: Record<string, [number, number][]>;
  /** Joriy modul yoki tanaffus tugaydigan vaqt (ms) */
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
    /* storage yopiq bo'lsa ham test davom etadi */
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
