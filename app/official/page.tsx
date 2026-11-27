import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rasmiy mashq resurslari — SAT Acers" };

const STEPS = [
  {
    icon: "💻",
    title: "Bluebook: to'liq practice testlar",
    text: "College Board'ning rasmiy ilovasi. Bepul to'liq adaptiv testlar haqiqiy imtihondagidek ishlaydi. Avval bitta test topshirib, boshlang'ich balingizni bilib oling.",
    href: "https://bluebook.collegeboard.org/students",
    cta: "Bluebook'ni yuklab olish",
  },
  {
    icon: "📊",
    title: "My Practice: natijalar tahlili",
    text: "Bluebook testidan keyin shu yerda balingiz, har bir savol, to'g'ri javob va tushuntirishlarni ko'rasiz.",
    href: "https://mypractice.collegeboard.org/login",
    cta: "My Practice'ni ochish",
  },
  {
    icon: "🗂",
    title: "Question Bank: rasmiy savollar bazasi",
    text: "Minglab rasmiy savollar: bo'lim, domen va qiyinlik bo'yicha filtr bor. Akkaunt shart emas.",
    href: "https://satsuitequestionbank.collegeboard.org/",
    cta: "Question Bank'ni ochish",
  },
  {
    icon: "🎓",
    title: "Khan Academy: rasmiy kurs",
    text: "College Board bilan birga tayyorlangan bepul kurs: video darslar, maqolalar, har bir ko'nikma bo'yicha mashqlar.",
    href: "https://www.khanacademy.org/test-prep/digital-sat",
    cta: "Kursni boshlash",
  },
  {
    icon: "☀️",
    title: "Question of the Day",
    text: "Har kuni bitta rasmiy savol. SAT Acers'dagi kunlik 5 savol bilan birga zo'r odat bo'ladi.",
    href: "https://qotd.collegeboard.org/",
    cta: "Bugungi savol",
  },
];

export default function OfficialPage() {
  return (
    <div className="container" style={{ paddingBottom: 40 }}>
      <div className="page-title">
        <h1>🏛 Rasmiy mashq resurslari</h1>
        <p>College Board'ning bepul rasmiy materiallari — bir joyda, o'zbekcha izoh bilan.</p>
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
        <h2>Haftalik reja: rasmiy resurslar + SAT Acers</h2>
        <ol>
          <li><b>1-kun:</b> Bluebook'da bitta to'liq test topshiring va My Practice'da natijani ko'ring.</li>
          <li><b>2–6-kunlar:</b> eng zaif 2 ta domeningizni SAT Acers question bank'ida mashq qiling (kuniga kamida 5 savol 🔥).</li>
          <li><b>Har kuni:</b> Xatonomadagi savollarni takrorlang.</li>
          <li><b>7-kun:</b> SAT Acers mock testini topshiring va ballni solishtiring.</li>
        </ol>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <a className="btn btn-navy" href="/practice">Question bank</a>
          <a className="btn btn-light" href="/mock">Mock testlar</a>
        </div>
      </div>

      <p className="score-note" style={{ marginTop: 20 }}>
        Bu havolalar College Board va Khan Academy saytlariga olib boradi. SAT Acers ular bilan bog'liq emas.
      </p>
    </div>
  );
}
