"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { NAME_MAX, cleanName, defaultName, fetchBoard, loadProfile, updateProfile, type Board, type LeaderRow, type Profile } from "@/lib/leaderboard";
import { useAuth } from "./AuthProvider";
import { useProgress } from "@/lib/useProgress";
import { currentStreak, weekAnswered } from "@/lib/progress";
import { Icon } from "./Icons";

const MEDAL = ["🥇", "🥈", "🥉"];

export function Leaderboard() {
  const { user, status, ready } = useAuth();
  const [board, setBoard] = useState<Board>("week");
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({ updatedAt: 0 });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const progress = useProgress();
  const myWeek = progress ? weekAnswered(progress) : 0;
  const myStreak = progress ? currentStreak(progress) : 0;

  useEffect(() => {
    const update = () => setProfile(loadProfile());
    update();
    window.addEventListener("acers:profile", update);
    return () => window.removeEventListener("acers:profile", update);
  }, []);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    setError(null);
    try {
      setRows(await fetchBoard(sb, board));
    } catch (e) {
      const msg = (e as { message?: string }).message ?? "";
      setError(/relation|does not exist|schema cache/i.test(msg) ? "setup" : "network");
      setRows([]);
    }
  }, [board]);

  useEffect(() => {
    if (status === "off") return;
    setRows(null);
    load();
  }, [load, status]);

  // Refresh after our own row is pushed
  useEffect(() => {
    if (status !== "synced") return;
    const t = window.setTimeout(load, 800);
    return () => window.clearTimeout(t);
  }, [status, load]);

  const myName = user ? cleanName(profile.name || "") || defaultName(user.id) : "";
  const saveName = () => {
    const n = cleanName(draft);
    updateProfile({ name: n || undefined });
    setEditing(false);
  };

  if (status === "off") {
    return (
      <div>
        <Head />
        <div className="empty"><h3>The leaderboard isn&apos;t available yet</h3><p>It needs sign-in, which is turned off on this site.</p></div>
      </div>
    );
  }

  const value = (r: LeaderRow) => (board === "week" ? r.week_answered : r.streak);
  const unit = (n: number) => (board === "week" ? (n === 1 ? "question" : "questions") : n === 1 ? "day" : "days");

  return (
    <div>
      <Head />

      <div className="lb-layout">
        <section>
          <div className="lb-tabs">
            <div className="seg">
              <button className={board === "week" ? "on" : ""} onClick={() => setBoard("week")}>This week</button>
              <button className={board === "streak" ? "on" : ""} onClick={() => setBoard("streak")}>Streaks</button>
            </div>
            <small className="muted-s">
              {board === "week" ? "Questions answered since Monday. Resets every week." : "Current practice streaks, in days."}
            </small>
          </div>

          {error === "setup" ? (
            <div className="empty"><h3>The leaderboard is being set up</h3><p>Check back soon.</p></div>
          ) : error ? (
            <div className="empty">
              <h3>Couldn&apos;t load the leaderboard</h3>
              <p>Check your connection and try again.</p>
              <button className="btn btn-primary" onClick={load}>Try again</button>
            </div>
          ) : rows === null ? (
            <div className="lb-list">{[0, 1, 2, 3].map((i) => <div key={i} className="lb-row skeleton" />)}</div>
          ) : rows.length === 0 ? (
            <div className="empty">
              <h3>{board === "week" ? "No one has practiced this week yet" : "No active streaks yet"}</h3>
              <p>Answer a question and you&apos;ll be first on the board.</p>
              <a className="btn btn-primary" href="/practice">Start practicing</a>
            </div>
          ) : (
            <ol className="lb-list">
              {rows.map((r, i) => (
                <li key={r.user_id} className={`lb-row ${user?.id === r.user_id ? "me" : ""} ${i < 3 ? "top" : ""}`}>
                  <span className="lb-rank">{MEDAL[i] ?? i + 1}</span>
                  <span className="lb-name">
                    {r.display_name}
                    {user?.id === r.user_id && <small> (you)</small>}
                  </span>
                  <span className="lb-val">
                    <b>{value(r)}</b> {unit(value(r))}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="tile-card lb-me">
          {!ready ? null : user ? (
            <>
              <div className="card-label"><Icon name="podium" size={18} /> Your leaderboard profile</div>
              {editing ? (
                <div className="lb-edit">
                  <input
                    value={draft}
                    maxLength={NAME_MAX}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                    placeholder={defaultName(user.id)}
                    aria-label="Leaderboard name"
                    autoFocus
                  />
                  <div className="lb-edit-actions">
                    <button className="btn btn-primary btn-sm" onClick={saveName}>Save name</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                  <small className="muted-s">Up to {NAME_MAX} characters. Everyone can see this name.</small>
                </div>
              ) : (
                <div className="lb-name-row">
                  <b>{myName}</b>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setDraft(profile.name || ""); setEditing(true); }}>
                    <Icon name="pen" size={14} /> Change name
                  </button>
                </div>
              )}
              <div className="lb-mine">
                <span><b>{myWeek}</b> this week</span>
                <span><b>{myStreak}</b> day streak</span>
              </div>
              <label className="lb-toggle">
                <input type="checkbox" checked={!profile.hidden} onChange={(e) => updateProfile({ hidden: !e.target.checked })} />
                <span>Show me on the leaderboard</span>
              </label>
              <small className="muted-s">
                Only your leaderboard name and practice counts are shown, never your email.
              </small>
            </>
          ) : (
            <>
              <div className="card-label"><Icon name="podium" size={18} /> Join the leaderboard</div>
              <p className="muted-s">Sign in to appear on the board. Your email stays private; you choose the name others see.</p>
              <a className="btn btn-primary" href="/login">Sign in</a>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function Head() {
  return (
    <div className="page-head">
      <div>
        <h1>Leaderboard</h1>
        <p>See who&apos;s practicing the most this week and who has the longest streak.</p>
      </div>
    </div>
  );
}
