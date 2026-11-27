import { HeroDemo } from "@/components/HeroDemo";
import { QUESTIONS } from "@/lib/questions";
import { MOCKS } from "@/lib/mocks";

const WEEK = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <h1>Har kuni bir qadam 1600 ga.</h1>
            <p className="lead">
              Digital SAT'ga tayyorgarlik: Bluebook'dagidek mock testlar, o'zbekcha tushuntirishlar va
              xatolaringizni o'zlashtirguningizcha qaytaradigan Xatonoma.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="/practice">Mashqni boshlash</a>
              <a className="btn btn-ghost" href="/mock">Mock test topshirish</a>
            </div>
            <div className="hero-proof">
              <span><b>{QUESTIONS.length}</b>savol</span>
              <span><b>{MOCKS.length}</b>mock test</span>
              <span><b>2 tilda</b>tushuntirish</span>
            </div>
          </div>
          <HeroDemo />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <div className="section-head">
            <h2>Ballni nima oshiradi</h2>
            <p>Ko'p savol yechish emas, xatodan o'rganish. SAT Acers shunga qurilgan.</p>
          </div>

          <div className="bento">
            <div className="tile xatonoma">
              <h3>Xatonoma</h3>
              <p>
                Xato qilgan har bir savol daftarga tushadi va 1, 3, 7 kundan keyin qaytib keladi. Uch marta ketma-ket
                to'g'ri yechsangiz, o'zlashtirilgan hisoblanadi.
              </p>
              <div className="tile-art mini-list" aria-hidden="true">
                <div className="mini-row"><span>Subject-verb agreement</span><span className="when now">Bugun</span></div>
                <div className="mini-row"><span>Circle equations</span><span className="when">Ertaga</span></div>
                <div className="mini-row"><span>Words in context</span><span className="when">3 kundan keyin</span></div>
              </div>
            </div>

            <div className="tile uz">
              <h3>O'zbekcha tushuntirish</h3>
              <p>Savol inglizcha, yechim ona tilingizda. Bitta tugma bilan inglizchaga o'tasiz.</p>
              <div className="tile-art" aria-hidden="true">
                <div className="uz-bubble">Ega — "The team", birlik. Demak fe'l ham birlikda: inspects.</div>
                <div className="uz-bubble">Tushunarli!</div>
              </div>
            </div>

            <div className="tile mock">
              <h3>Bluebook'dagidek mock</h3>
              <p>Modullar, taymer, Mark for Review, Desmos va oxirida domenlar bo'yicha tahlil.</p>
              <div className="tile-art timer-art" aria-hidden="true">31:58<small>Module 1</small></div>
            </div>

            <div className="tile streak">
              <h3>Kunlik 5 savol</h3>
              <p>Streak'ni uzmang: kichik qadamlar katta ball beradi.</p>
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
            <h2>Qanday boshlash kerak</h2>
          </div>
          <div className="steps">
            <div className="step">
              <h3>Mock test topshiring</h3>
              <p>Boshlang'ich balingizni va eng zaif domenlaringizni bilib oling.</p>
            </div>
            <div className="step">
              <h3>Zaif joyni mashq qiling</h3>
              <p>Question bank'da shu domenlarni filtrlab, har kuni 5 tadan savol yeching.</p>
            </div>
            <div className="step">
              <h3>Xatonomani takrorlang</h3>
              <p>Xatolar kerakli kunda o'zi qaytadi. Siz faqat ochib, yechasiz.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Bugungi 5 ta savol sizni kutyapti</h2>
              <p>Ro'yxatdan o'tish shart emas.</p>
            </div>
            <a className="btn btn-primary" href="/practice">Mashqni boshlash</a>
          </div>
        </div>
      </section>
    </>
  );
}
