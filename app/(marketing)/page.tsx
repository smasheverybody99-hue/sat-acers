import { HeroDemo } from "@/components/HeroDemo";
import { QUESTIONS } from "@/lib/questions";
import { MOCKS } from "@/lib/mocks";

const WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <h1>One step closer to 1600, every day.</h1>
            <p className="lead">
              Digital SAT prep with Bluebook-style mock tests, clear step-by-step explanations, and a Mistake Log
              that brings your errors back until you've mastered them.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="/practice">Start practicing</a>
              <a className="btn btn-ghost" href="/mock">Take a mock test</a>
            </div>
            <div className="hero-proof">
              <span><b>{QUESTIONS.length}</b>questions</span>
              <span><b>{MOCKS.length}</b>mock tests</span>
              <span><b>Free</b>no sign-up needed</span>
            </div>
          </div>
          <HeroDemo />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <div className="section-head">
            <h2>What actually raises your score</h2>
            <p>Not solving more questions, but learning from the ones you miss. SAT Acers is built around that.</p>
          </div>

          <div className="bento">
            <div className="tile xatonoma">
              <h3>Mistake Log</h3>
              <p>
                Every question you miss is saved and comes back after 1, 3 and 7 days. Get it right three times in a
                row and it counts as mastered.
              </p>
              <div className="tile-art mini-list" aria-hidden="true">
                <div className="mini-row"><span>Subject-verb agreement</span><span className="when now">Today</span></div>
                <div className="mini-row"><span>Circle equations</span><span className="when">Tomorrow</span></div>
                <div className="mini-row"><span>Words in context</span><span className="when">In 3 days</span></div>
              </div>
            </div>

            <div className="tile uz">
              <h3>Explanations that teach</h3>
              <p>Every question shows why the right answer works and why the traps don't.</p>
              <div className="tile-art" aria-hidden="true">
                <div className="uz-bubble">The subject is "The team," which is singular, so the verb is too: inspects.</div>
                <div className="uz-bubble">Got it!</div>
              </div>
            </div>

            <div className="tile mock">
              <h3>Bluebook-style mocks</h3>
              <p>Modules, a timer, Mark for Review, Desmos, and a breakdown by domain at the end.</p>
              <div className="tile-art timer-art" aria-hidden="true">31:58<small>Module 1</small></div>
            </div>

            <div className="tile streak">
              <h3>5 questions a day</h3>
              <p>Keep your streak alive. Small daily steps add up to big score gains.</p>
              <div className="tile-art week" aria-hidden="true">
                {WEEK.map((d, k) => (
                  <span key={d} className={k < 5 ? "on" : ""}><i>{k < 5 ? "🔥" : ""}</i>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2>How to get started</h2>
          </div>
          <div className="steps">
            <div className="step">
              <h3>Take a mock test</h3>
              <p>Find your starting score and your weakest domains.</p>
            </div>
            <div className="step">
              <h3>Practice your weak spots</h3>
              <p>Filter the question bank to those domains and solve 5 questions a day.</p>
            </div>
            <div className="step">
              <h3>Review your Mistake Log</h3>
              <p>Missed questions come back on the right day. You just open the log and solve them.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Today's 5 questions are waiting</h2>
              <p>No sign-up needed.</p>
            </div>
            <a className="btn btn-primary" href="/practice">Start practicing</a>
          </div>
        </div>
      </section>
    </>
  );
}
