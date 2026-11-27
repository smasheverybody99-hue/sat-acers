"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  VOCAB,
  VOCAB_BY_ID,
  buildDeck,
  dueCount,
  loadVocab,
  review,
  statusOf,
  type VocabState,
  type WordStatus,
} from "@/lib/vocab";
import { shortDate } from "@/lib/format";
import { Icon } from "./Icons";

const STATUS_LABEL: Record<WordStatus, string> = { new: "New", learning: "Learning", mastered: "Mastered" };

/** Bold the studied word (and its common endings) inside the example sentence */
function Example({ text, word }: { text: string; word: string }) {
  const stem = word.length > 5 ? word.slice(0, word.length - 2) : word;
  const re = new RegExp(`\\b(${stem}\\w*)`, "i");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) => (re.test(p) && i % 2 === 1 ? <b key={i}>{p}</b> : <span key={i}>{p}</span>))}
    </>
  );
}

export function VocabView() {
  const [state, setState] = useState<VocabState>({});
  const [loaded, setLoaded] = useState(false);
  const [queue, setQueue] = useState<string[] | null>(null);
  const [retried, setRetried] = useState<Record<string, boolean>>({});
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState({ knew: 0, total: 0 });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | WordStatus>("all");

  useEffect(() => {
    const update = () => setState(loadVocab());
    update();
    setLoaded(true);
    window.addEventListener("acers:vocab", update);
    return () => window.removeEventListener("acers:vocab", update);
  }, []);

  const counts = useMemo(() => {
    const c = { new: 0, learning: 0, mastered: 0 };
    for (const w of VOCAB) c[statusOf(state[w.id])]++;
    return c;
  }, [state]);
  const due = loaded ? dueCount(state) : 0;
  const deckSize = loaded ? buildDeck(state).length : 0;

  const start = () => {
    setQueue(buildDeck(loadVocab()));
    setRetried({});
    setFlipped(false);
    setDone({ knew: 0, total: 0 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const current = queue?.[0];

  const answer = useCallback(
    (knew: boolean) => {
      if (!current) return;
      setState(review(current, knew));
      // Count each card once, by how it went on the first try
      const first = !retried[current];
      setDone((d) => ({ knew: d.knew + (first && knew ? 1 : 0), total: d.total + (first ? 1 : 0) }));
      setFlipped(false);
      setQueue((q) => {
        if (!q) return q;
        const rest = q.slice(1);
        // A missed word comes back once at the end of the session
        if (!knew && !retried[current]) return [...rest, current];
        return rest;
      });
      if (!knew) setRetried((r) => ({ ...r, [current]: true }));
    },
    [current, retried]
  );

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && e.key === "1") answer(false);
      else if (flipped && e.key === "2") answer(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, flipped, answer]);

  const list = VOCAB.filter(
    (w) =>
      (filter === "all" || statusOf(state[w.id]) === filter) &&
      (!query || w.word.toLowerCase().includes(query.toLowerCase()) || w.definition.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Vocabulary</h1>
          <p>
            {VOCAB.length} words that often show up in SAT Words in Context questions. Words you know come back after 1,
            3, 7 and 21 days; words you miss come back sooner.
          </p>
        </div>
      </div>

      {queue && current ? (
        <section className="vc-session">
          <div className="vc-progress">
            <span>
              {done.total} reviewed · {queue.length} left
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setQueue(null)}>End session</button>
          </div>
          <button className={`vc-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((f) => !f)} aria-live="polite">
            <span className="vc-pos">{VOCAB_BY_ID[current].pos}</span>
            <span className="vc-word">{VOCAB_BY_ID[current].word}</span>
            {flipped ? (
              <span className="vc-back">
                <span className="vc-def">{VOCAB_BY_ID[current].definition}</span>
                <span className="vc-ex">
                  <Example text={VOCAB_BY_ID[current].example} word={VOCAB_BY_ID[current].word} />
                </span>
              </span>
            ) : (
              <span className="vc-hint">Think of the meaning, then tap to check</span>
            )}
          </button>
          {flipped ? (
            <div className="vc-actions">
              <button className="btn vc-miss" onClick={() => answer(false)}>
                <Icon name="repeat" size={18} /> Still learning <kbd>1</kbd>
              </button>
              <button className="btn vc-knew" onClick={() => answer(true)}>
                <Icon name="check" size={18} /> Knew it <kbd>2</kbd>
              </button>
            </div>
          ) : (
            <div className="vc-actions">
              <button className="btn btn-primary" onClick={() => setFlipped(true)}>
                Show meaning <kbd>Space</kbd>
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="tile-card vc-start">
          {queue && done.total > 0 ? (
            <div>
              <h2>Session complete 🎉</h2>
              <p className="muted-s">
                You knew {done.knew} of {done.total} cards on the first try.
                {due ? ` ${due} more ${due === 1 ? "word is" : "words are"} due now.` : " Come back tomorrow for your next review."}
              </p>
            </div>
          ) : (
            <div>
              <h2>{due ? `${due} ${due === 1 ? "word" : "words"} to review` : counts.new ? "Learn new words" : "All caught up"}</h2>
              <p className="muted-s">
                {deckSize
                  ? `This session: ${deckSize} cards${counts.new ? `, including up to 10 new words` : ""}.`
                  : "Nothing is due right now. Come back later for your next review."}
              </p>
            </div>
          )}
          <div className="vc-stats">
            <span><b>{counts.new}</b> new</span>
            <span><b>{counts.learning}</b> learning</span>
            <span><b>{counts.mastered}</b> mastered</span>
          </div>
          <button className="btn btn-primary" onClick={start} disabled={!deckSize}>
            <Icon name="play" size={16} /> {queue ? "Study again" : "Start studying"}
          </button>
        </section>
      )}

      <section className="vc-list-wrap">
        <div className="vc-list-head">
          <h2 className="sub-h">All words</h2>
          <div className="vc-filters">
            <input
              className="vc-search"
              type="search"
              placeholder="Search words or meanings"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search words"
            />
            <div className="seg">
              {(["all", "new", "learning", "mastered"] as const).map((f) => (
                <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
                  {f === "all" ? "All" : STATUS_LABEL[f]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="vc-list">
          {list.map((w) => {
            const c = state[w.id];
            const st = statusOf(c);
            return (
              <div key={w.id} className="vc-row">
                <div>
                  <b>{w.word}</b> <small>{w.pos}</small>
                  <p>{w.definition}</p>
                </div>
                <span className={`vc-status ${st}`} title={c ? `Next review: ${shortDate(c.due)}` : "Not studied yet"}>
                  {STATUS_LABEL[st]}
                </span>
              </div>
            );
          })}
          {!list.length && <p className="muted-s">No words match.</p>}
        </div>
      </section>
    </div>
  );
}
