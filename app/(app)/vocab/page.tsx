import type { Metadata } from "next";
import { VocabView } from "@/components/VocabView";

export const metadata: Metadata = { title: "Vocabulary — SAT Acers" };

export default function VocabPage() {
  return <VocabView />;
}
