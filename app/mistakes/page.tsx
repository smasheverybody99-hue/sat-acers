import type { Metadata } from "next";
import { Mistakes } from "@/components/Mistakes";

export const metadata: Metadata = { title: "Xatonoma — SAT Acers" };

export default function MistakesPage() {
  return (
    <div className="container">
      <div className="page-title">
        <h1>📒 Xatonoma</h1>
        <p>Xatoing — eng yaxshi ustozing. Har bir xato 1, 3 va 7 kundan keyin qaytib keladi.</p>
      </div>
      <Mistakes />
    </div>
  );
}
