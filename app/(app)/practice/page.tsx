import type { Metadata } from "next";
import { PracticeRoot } from "@/components/PracticeRoot";

export const metadata: Metadata = { title: "Question bank — SAT Acers" };

export default function PracticePage() {
  return <PracticeRoot />;
}
