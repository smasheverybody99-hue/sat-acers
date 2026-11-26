import type { Metadata } from "next";
import { Practice } from "@/components/Practice";

export const metadata: Metadata = { title: "Question bank — SAT Acers" };

export default function PracticePage() {
  return (
    <div className="container">
      <div className="page-title">
        <h1>Question bank</h1>
        <p>Filtrlang, yeching, tushuning. Xato qilgan savollar avtomatik Xatonomaga tushadi.</p>
      </div>
      <Practice />
    </div>
  );
}
