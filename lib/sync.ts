/**
 * Cloud sync.
 * The source of truth is browser storage (works offline). On sign-in, cloud data is
 * MERGED with local data (nothing is lost), then every change is pushed to the cloud.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadProgress, saveProgressRaw, type Progress } from "./progress";
import { loadHistory, saveHistoryRaw } from "./mockStore";
import type { MockResult } from "./mocks";
import { loadVocab, mergeVocab, saveVocabRaw, type VocabState } from "./vocab";
import { loadProfile, mergeProfile, pushLeaderboard, saveProfileRaw, type Profile } from "./leaderboard";

export interface CloudRow {
  progress: Progress | null;
  mock_history: MockResult[] | null;
  vocab?: VocabState | null;
  profile?: Profile | null;
}

/** Merge progress from two devices */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const attempts: Progress["attempts"] = { ...a.attempts };
  for (const [id, x] of Object.entries(b.attempts)) {
    const y = attempts[id];
    if (!y) attempts[id] = x;
    else {
      const latest = x.lastAt >= y.lastAt ? x : y;
      attempts[id] = {
        tries: Math.max(x.tries, y.tries),
        correct: Math.max(x.correct, y.correct),
        lastCorrect: latest.lastCorrect,
        lastAt: latest.lastAt,
        ...(latest.ms ? { ms: latest.ms } : {}),
      };
    }
  }

  // Mistake Log: decide based on the latest attempt
  const mistakes: Progress["mistakes"] = {};
  const ids = new Set([...Object.keys(a.mistakes), ...Object.keys(b.mistakes)]);
  for (const id of ids) {
    const ma = a.mistakes[id];
    const mb = b.mistakes[id];
    const lastAtA = a.attempts[id]?.lastAt ?? 0;
    const lastAtB = b.attempts[id]?.lastAt ?? 0;
    const fromNewer = lastAtA >= lastAtB ? ma : mb;
    const fromOther = lastAtA >= lastAtB ? mb : ma;
    // If the newer device removed a question from the Mistake Log (mastered), don't bring it back
    const newerHasAttempt = (lastAtA >= lastAtB ? lastAtA : lastAtB) > 0;
    if (fromNewer) mistakes[id] = fromNewer;
    else if (!newerHasAttempt && fromOther) mistakes[id] = fromOther;
  }

  // Streak: the latest day wins; on the same day, take the larger count
  let streak = a.streak;
  const sa = a.streak, sb = b.streak;
  if (!sa.lastDay || (sb.lastDay && sb.lastDay > sa.lastDay)) streak = sb;
  else if (sb.lastDay === sa.lastDay) streak = { lastDay: sa.lastDay, count: Math.max(sa.count, sb.count) };

  let daily = a.daily;
  if (!a.daily.day || (b.daily.day && b.daily.day > a.daily.day)) daily = b.daily;
  else if (a.daily.day === b.daily.day) daily = { day: a.daily.day, answered: Math.max(a.daily.answered, b.daily.answered) };

  const days: Progress["days"] = { ...(a.days ?? {}) };
  for (const [d, n] of Object.entries(b.days ?? {})) days[d] = Math.max(days[d] ?? 0, n);

  return { attempts, mistakes, streak, daily, days };
}

export function mergeHistory(a: MockResult[], b: MockResult[]): MockResult[] {
  const map = new Map<string, MockResult>();
  for (const r of [...a, ...b]) map.set(`${r.mockId}:${r.finishedAt}`, r);
  return [...map.values()].sort((x, y) => y.finishedAt - x.finishedAt).slice(0, 50);
}

const isEmpty = (p: Progress) => !Object.keys(p.attempts).length && !p.streak.lastDay;

/**
 * The vocab and profile columns were added later (supabase/schema.sql). Until the
 * migration has been run, sync keeps working without them.
 */
let extraColumns = true;
const missingColumn = (e: { message?: string; code?: string } | null) =>
  !!e && (e.code === "42703" || e.code === "PGRST204" || /column/i.test(e.message ?? ""));

/** After sign-in: pull from cloud → merge → save to both */
export async function pullAndMerge(sb: SupabaseClient, userId: string): Promise<void> {
  let res = await sb
    .from("user_data")
    .select(extraColumns ? "progress, mock_history, vocab, profile" : "progress, mock_history")
    .eq("user_id", userId)
    .maybeSingle();
  if (res.error && extraColumns && missingColumn(res.error)) {
    extraColumns = false;
    res = await sb.from("user_data").select("progress, mock_history").eq("user_id", userId).maybeSingle();
  }
  if (res.error) throw res.error;
  const row = (res.data ?? { progress: null, mock_history: null }) as CloudRow;
  const local = loadProgress();
  const merged = row.progress ? (isEmpty(local) ? row.progress : mergeProgress(local, row.progress)) : local;
  const history = mergeHistory(loadHistory(), row.mock_history ?? []);
  saveProgressRaw(merged);
  saveHistoryRaw(history);
  if (row.vocab) saveVocabRaw(mergeVocab(loadVocab(), row.vocab));
  if (row.profile) saveProfileRaw(mergeProfile(loadProfile(), row.profile));
  await push(sb, userId);
}

export async function push(sb: SupabaseClient, userId: string): Promise<void> {
  const base = {
    user_id: userId,
    progress: loadProgress(),
    mock_history: loadHistory(),
    updated_at: new Date().toISOString(),
  };
  let { error } = await sb
    .from("user_data")
    .upsert(extraColumns ? { ...base, vocab: loadVocab(), profile: loadProfile() } : base);
  if (error && extraColumns && missingColumn(error)) {
    extraColumns = false;
    ({ error } = await sb.from("user_data").upsert(base));
  }
  if (error) throw error;
  await pushLeaderboard(sb, userId);
}
