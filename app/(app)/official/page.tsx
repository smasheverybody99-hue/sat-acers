import type { Metadata } from "next";

export const metadata: Metadata = { title: "Official practice resources — SAT Acers" };

const STEPS = [
  {
    icon: "💻",
    title: "Bluebook: full-length practice tests",
    text: "College Board's official testing app. Its free, full-length adaptive tests work exactly like the real exam. Take one first to find your starting score.",
    href: "https://bluebook.collegeboard.org/students",
    cta: "Download Bluebook",
  },
  {
    icon: "📊",
    title: "My Practice: score reports",
    text: "After a Bluebook test, see your score here along with every question, the correct answer, and explanations.",
    href: "https://mypractice.collegeboard.org/login",
    cta: "Open My Practice",
  },
  {
    icon: "🗂",
    title: "Question Bank: official questions",
    text: "Thousands of official questions you can filter by section, domain and difficulty. No account needed.",
    href: "https://satsuitequestionbank.collegeboard.org/",
    cta: "Open the Question Bank",
  },
  {
    icon: "🎓",
    title: "Khan Academy: official course",
    text: "A free course built with College Board: video lessons, articles, and practice for every skill.",
    href: "https://www.khanacademy.org/test-prep/digital-sat",
    cta: "Start the course",
  },
  {
    icon: "☀️",
    title: "Question of the Day",
    text: "One official question every day. Paired with your 5 daily questions on SAT Acers, it makes a great habit.",
    href: "https://qotd.collegeboard.org/",
    cta: "Today's question",
  },
];

export default function OfficialPage() {
  return (
    <div className="official">
      <div className="page-head">
        <div>
          <h1>Official practice resources</h1>
          <p>College Board's free official materials, all in one place, with notes on how to use each one.</p>
        </div>
      </div>

      <div className="official-grid">
        {STEPS.map((s, i) => (
          <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="official-card">
            <div className="official-num">{i + 1}</div>
            <div className="feature-icon-lg">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <span className="mock-go">{s.cta} ↗</span>
          </a>
        ))}
      </div>

      <div className="plan-box">
        <h2>Weekly plan: official resources + SAT Acers</h2>
        <ol>
          <li><b>Day 1:</b> Take one full test in Bluebook and review the results in My Practice.</li>
          <li><b>Days 2–6:</b> Practice your 2 weakest domains in the SAT Acers question bank (at least 5 questions a day 🔥).</li>
          <li><b>Every day:</b> Review the questions in your Mistake Log.</li>
          <li><b>Day 7:</b> Take an SAT Acers mock test and compare your score.</li>
        </ol>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <a className="btn btn-navy" href="/practice">Question bank</a>
          <a className="btn btn-light" href="/mock">Mock tests</a>
        </div>
      </div>

      <p className="score-note" style={{ marginTop: 20 }}>
        These links go to the College Board and Khan Academy websites. SAT Acers is not affiliated with them.
      </p>
    </div>
  );
}
