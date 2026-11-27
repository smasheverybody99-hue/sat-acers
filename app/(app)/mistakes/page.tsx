import type { Metadata } from "next";
import { Mistakes } from "@/components/Mistakes";

export const metadata: Metadata = { title: "Xatonoma — SAT Acers" };

export default function MistakesPage() {
  return <Mistakes />;
}
