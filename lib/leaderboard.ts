import type { SupabaseClient } from "@supabase/supabase-js";
import { currentStreak, dayKey, loadProgress, totalAnswered, weekAnswered, weekKey } from "./progress";

/** Leaderboard settings, synced through user_data.profile */
export interface Profile {
  /** Name shown on the leaderboard */
  name?: string;
  /** true = don't show me on the leaderboard */
  hidden?: boolean;
  updatedAt: number;
}

export interface LeaderRow {
  user_id: string;
  display_name: string;
  week_start: string;
  week_answered: number;
  streak: number;
  last_day: string | null;
  total_answered: number;
}

const KEY = "acers:profile";
export const NAME_MAX = 24;

export function loadProfile(): Profile {
  if (typeof window === "undefined") return { updatedAt: 0 };
  try {
    return { updatedAt: 0, ...JSON.parse(window.localStorage.getItem(KEY) || "{}") };
  } catch {
    return { updatedAt: 0 };
  }
}

function save(p: Profile, fromSync = false) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent("acers:profile", { detail: { fromSync } }));
  } catch {
    /* storage blocked */
  }
}

export function updateProfile(patch: Partial<Omit<Profile, "updatedAt">>) {
  save({ ...loadProfile(), ...patch, updatedAt: Date.now() });
}

export const saveProfileRaw = (p: Profile) => save(p, true);

export function mergeProfile(a: Profile, b: Profile | null | undefined): Profile {
  if (!b) return a;
  return (b.updatedAt ?? 0) > (a.updatedAt ?? 0) ? b : a;
}

/** Clean up a display name: trim, collapse spaces, limit length */
export function cleanName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, NAME_MAX);
}

/** Default public name: never the email, just "Acer" plus a short tag from the account id */
export function defaultName(userId: string): string {
  return `Acer ${userId.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}

/** Publish (or remove) this user's leaderboard row. Errors are logged, never thrown. */
export async function pushLeaderboard(sb: SupabaseClient, userId: string): Promise<void> {
  const profile = loadProfile();
  try {
    if (profile.hidden) {
      await sb.from("leaderboard").delete().eq("user_id", userId);
      return;
    }
    const p = loadProgress();
    const now = Date.now();
    const streak = currentStreak(p, now);
    const { error } = await sb.from("leaderboard").upsert({
      user_id: userId,
      display_name: cleanName(profile.name || "") || defaultName(userId),
      week_start: weekKey(now),
      week_answered: Math.min(weekAnswered(p, now), 5000),
      streak: Math.min(streak, 3650),
      last_day: p.streak.lastDay ?? dayKey(now),
      total_answered: totalAnswered(p),
      updated_at: new Date().toISOString(),
    });
    if (error) console.warn("[leaderboard]", error.message);
  } catch (e) {
    console.warn("[leaderboard]", e);
  }
}

export type Board = "week" | "streak";

export async function fetchBoard(sb: SupabaseClient, board: Board): Promise<LeaderRow[]> {
  const now = Date.now();
  const cols = "user_id, display_name, week_start, week_answered, streak, last_day, total_answered";
  const q =
    board === "week"
      ? sb.from("leaderboard").select(cols).eq("week_start", weekKey(now)).gt("week_answered", 0).order("week_answered", { ascending: false })
      : sb.from("leaderboard").select(cols).gte("last_day", dayKey(now - 86_400_000)).gt("streak", 0).order("streak", { ascending: false });
  const { data, error } = await q.limit(50);
  if (error) throw error;
  return (data ?? []) as LeaderRow[];
}
