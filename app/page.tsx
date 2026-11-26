import { QUESTIONS } from "@/lib/questions";

const FEATURES = [
  {
    icon: "🎯",
    title: "Question bank",
    text: "Bo'lim, domen va qiyinlik bo'yicha filtr. Bluebook uslubidagi interfeys — imtihonda hech narsa yangi bo'lmaydi.",
  },
  {
    icon: "🇺🇿",
    title: "O'zbekcha tushuntirish",
    text: "Savol inglizcha, yechim esa ona tilingizda. Bitta tugma bilan inglizchaga o'tasiz.",
    highlight: true,
  },
  {
    icon: "📒",
    title: "Xatonoma",
    text: "Har bir xatoingiz daftarga tushadi va 1, 3, 7 kundan keyin qaytib keladi — toki o'zlashtirmaguningizcha.",
  },
  {
    icon: "🔥",
    title: "Kunlik streak",
    text: "Har kuni 5 ta savol. Kichik qadamlar — katta ball.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="eyebrow">
              <span className="dot" /> Digital SAT tayyorgarlik
            </span>
            <h1>
              <span className="ace">
                Ace it.
                <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 10 C 50 2, 150 2, 198 8" stroke="#FACC15" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              <br />
              Har kuni.
            </h1>
            <p className="lead">
              Xatoing — eng yaxshi ustozing. Savol yeching, o'zbekcha tushuntirishni o'qing, xatolaringizni Xatonoma
              orqali o'zlashtiring va 1600 sari kunma-kun yaqinlashing.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="/practice">Mashqni boshlash →</a>
              <a className="btn btn-ghost" href="/mock">Mock test topshirish</a>
            </div>
            <div className="hero-meta">
              <span><b>{QUESTIONS.length}+</b>savol</span>
              <span><b>8</b>domen</span>
              <span><b>2 til</b>tushuntirish</span>
            </div>
          </div>

          <div className="preview" aria-hidden="true">
            <div className="preview-card">
              <div className="meta">
                <span>Math · Algebra</span>
                <span>3 / 20</span>
              </div>
              <div className="q">If 4x − 9 = 23, what is the value of x?</div>
              <div className="choices">
                <div className="choice"><span className="letter">A</span>6</div>
                <div className="choice right"><span className="letter">B</span>8</div>
                <div className="choice"><span className="letter">C</span>14</div>
              </div>
              <div className="result ok" style={{ marginTop: 14 }}>
                <p><b>✅ To'g'ri!</b> Ikkala tomonga 9 qo'shamiz: 4x = 32, demak x = 8.</p>
              </div>
            </div>
            <div className="preview-float streak">🔥 7 kun ketma-ket</div>
            <div className="preview-float uz">🇺🇿 O'zbekcha tushuntirish</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Nega SAT Acers?</h2>
            <p>Oddiy, tez va aynan sizga moslangan. Ortiqcha narsa yo'q — faqat ballingizni oshiradigan narsalar.</p>
          </div>
          <div className="features">
            {FEATURES.map((f) => (
              <div key={f.title} className={`feature ${f.highlight ? "hl" : ""}`}>
                <div className="icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2>Qanday ishlaydi</h2>
          </div>
          <div className="steps">
            <div className="step">
              <h3>Savol tanlang</h3>
              <p>Math yoki Reading &amp; Writing, kerakli domen va qiyinlikni tanlang.</p>
            </div>
            <div className="step">
              <h3>Yeching va tushuning</h3>
              <p>Javobni darhol tekshiring, tushuntirishni o'zbekcha yoki inglizcha o'qing.</p>
            </div>
            <div className="step">
              <h3>Xatoni qaytaring</h3>
              <p>Xatonoma xato savollarni kerakli vaqtda qayta beradi — bilim mustahkam o'rnashadi.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Bugungi 5 ta savol sizni kutyapti</h2>
              <p>Ro'yxatdan o'tish shart emas — hoziroq boshlang.</p>
            </div>
            <a className="btn btn-navy" href="/practice">Boshlash →</a>
          </div>
        </div>
      </section>
    </>
  );
}
