import type { Metadata } from "next";
import { Mistakes } from "@/components/Mistakes";

export const metadata: Metadata = { title: "Mistake Log — SAT Acers" };

export default function MistakesPage() {
  return <Mistakes />;
}
