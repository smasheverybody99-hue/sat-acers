/**
 * Bulut bilan sinxronlash.
 * Asosiy manba — brauzer xotirasi (internet bo'lmasa ham ishlaydi). Kirilganda bulutdagi ma'lumot
 * mahalliy ma'lumot bilan BIRLASHTIRILADI (hech narsa o'chib ketmaydi), keyin har o'zgarishda bulutga yuboriladi.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadProgress, saveProgressRaw, type Progress } from "./progress";
import { loadHistory, saveHistoryRaw } from "./mockStore";
import type { MockResult } from "./mocks";

export interface CloudRow {
  progress: Progress | null;
  mock_history: MockResult[] | null;
}

/** Ikki qurilmadagi progressni birlashtirish */
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
      };
    }
  }

  // Xatonoma: oxirgi urinish natijasiga qarab qaror qilamiz
  const mistakes: Progress["mistakes"] = {};
  const ids = new Set([...Object.keys(a.mistakes), ...Object.keys(b.mistakes)]);
  for (const id of ids) {
    const ma = a.mistakes[id];
    const mb = b.mistakes[id];
    const lastAtA = a.attempts[id]?.lastAt ?? 0;
    const lastAtB = b.attempts[id]?.lastAt ?? 0;
    const fromNewer = lastAtA >= lastAtB ? ma : mb;
    const fromOther = lastAtA >= lastAtB ? mb : ma;
    // Yangiroq qurilmada savol xatonomadan chiqarilgan bo'lsa (o'zlashtirilgan), uni qaytarmaymiz
    const newerHasAttempt = (lastAtA >= lastAtB ? lastAtA : lastAtB) > 0;
    if (fromNewer) mistakes[id] = fromNewer;
    else if (!newerHasAttempt && fromOther) mistakes[id] = fromOther;
  }

  // Streak: eng so'nggi kun ustun, bir xil kun bo'lsa — kattasi
  let streak = a.streak;
  const sa = a.streak, sb = b.streak;
  if (!sa.lastDay || (sb.lastDay && sb.lastDay > sa.lastDay)) streak = sb;
  else if (sb.lastDay === sa.lastDay) streak = { lastDay: sa.lastDay, count: Math.max(sa.count, sb.count) };

  let daily = a.daily;
  if (!a.daily.day || (b.daily.day && b.daily.day > a.daily.day)) daily = b.daily;
  else if (a.daily.day === b.daily.day) daily = { day: a.daily.day, answered: Math.max(a.daily.answered, b.daily.answered) };

  return { attempts, mistakes, streak, daily };
}

export function mergeHistory(a: MockResult[], b: MockResult[]): MockResult[] {
  const map = new Map<string, MockResult>();
  for (const r of [...a, ...b]) map.set(`${r.mockId}:${r.finishedAt}`, r);
  return [...map.values()].sort((x, y) => y.finishedAt - x.finishedAt).slice(0, 50);
}

const isEmpty = (p: Progress) => !Object.keys(p.attempts).length && !p.streak.lastDay;

/** Kirgandan keyin: bulutdan olish → birlashtirish → ikkala joyga saqlash */
export async function pullAndMerge(sb: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await sb.from("user_data").select("progress, mock_history").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  const row = (data ?? { progress: null, mock_history: null }) as CloudRow;
  const local = loadProgress();
  const merged = row.progress ? (isEmpty(local) ? row.progress : mergeProgress(local, row.progress)) : local;
  const history = mergeHistory(loadHistory(), row.mock_history ?? []);
  saveProgressRaw(merged);
  saveHistoryRaw(history);
  await push(sb, userId);
}

export async function push(sb: SupabaseClient, userId: string): Promise<void> {
  const { error } = await sb.from("user_data").upsert({
    user_id: userId,
    progress: loadProgress(),
    mock_history: loadHistory(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
