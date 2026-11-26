import type { Metadata } from "next";
import { MOCKS, mockMinutes, mockQuestionCount } from "@/lib/mocks";

export const metadata: Metadata = { title: "Mock testlar — SAT Acers" };

export default function MockListPage() {
  return (
    <div className="container" style={{ paddingBottom: 40 }}>
      <div className="page-title">
        <h1>Mock testlar</h1>
        <p>Bluebook uslubida: modullar, taymer, tanaffus, Mark for Review va oxirida batafsil tahlil.</p>
      </div>
      <div className="mock-grid">
        {MOCKS.map((m) => (
          <a key={m.id} href={`/mock/${m.id}`} className="mock-card">
            <div className="mock-card-top">
              <h3>{m.title}</h3>
              <span className="tag">{m.modules.length} modul</span>
            </div>
            {m.description && <p>{m.description}</p>}
            <div className="mock-meta">
              <span>📝 {mockQuestionCount(m)} savol</span>
              <span>⏱ {mockMinutes(m)} daqiqa</span>
            </div>
            <span className="mock-go">Boshlash →</span>
          </a>
        ))}
      </div>
    </div>
  );
}
