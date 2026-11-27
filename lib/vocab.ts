import raw from "@/data/vocab.json";

export interface VocabWord {
  id: string;
  word: string;
  pos: string;
  definition: string;
  example: string;
}

/** Leitner-style review state for one word */
export interface VocabCard {
  /** 0 = learning; each "Knew it" moves the card up one box */
  box: number;
  due: number;
  lastAt: number;
  reviews: number;
}

export type VocabState = Record<string, VocabCard>;

export const VOCAB = raw as VocabWord[];
export const VOCAB_BY_ID: Record<string, VocabWord> = Object.fromEntries(VOCAB.map((w) => [w.id, w]));

const KEY = "acers:vocab";
const MIN = 60_000;
const DAY = 24 * 60 * MIN;
/** Days until the next review, by box. Box 4 and up counts as mastered. */
export const BOX_DAYS = [0, 1, 3, 7, 21, 45];
export const MASTERED_BOX = 4;
/** New words introduced per session */
export const NEW_PER_SESSION = 10;

export function loadVocab(): VocabState {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as VocabState;
  } catch {
    return {};
  }
}

function save(s: VocabState, fromSync = false) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("acers:vocab", { detail: { fromSync } }));
  } catch {
    /* storage blocked */
  }
}

export const saveVocabRaw = (s: VocabState) => save(s, true);

export function review(id: string, knew: boolean, now = Date.now()): VocabState {
  const s = loadVocab();
  const prev = s[id];
  const box = knew ? Math.min((prev?.box ?? 0) + 1, BOX_DAYS.length - 1) : 0;
  // A missed word comes back in 10 minutes (later in the same session); known words wait for their box interval.
  const due = knew ? now + BOX_DAYS[box] * DAY : now + 10 * MIN;
  s[id] = { box, due, lastAt: now, reviews: (prev?.reviews ?? 0) + 1 };
  save(s);
  return s;
}

export type WordStatus = "new" | "learning" | "mastered";

export function statusOf(c: VocabCard | undefined): WordStatus {
  if (!c) return "new";
  return c.box >= MASTERED_BOX ? "mastered" : "learning";
}

/** Words due now, then new words, for one study session */
export function buildDeck(s: VocabState, now = Date.now()): string[] {
  const due = VOCAB.filter((w) => s[w.id] && s[w.id].due <= now)
    .sort((a, b) => s[a.id].due - s[b.id].due)
    .map((w) => w.id);
  const fresh = VOCAB.filter((w) => !s[w.id]).slice(0, NEW_PER_SESSION).map((w) => w.id);
  return [...due, ...fresh];
}

export function dueCount(s: VocabState, now = Date.now()): number {
  return VOCAB.filter((w) => s[w.id] && s[w.id].due <= now).length;
}

/** Merge two devices' vocab state: the most recent review of each word wins */
export function mergeVocab(a: VocabState, b: VocabState): VocabState {
  const out: VocabState = { ...a };
  for (const [id, c] of Object.entries(b)) if (!out[id] || c.lastAt > out[id].lastAt) out[id] = c;
  return out;
}
