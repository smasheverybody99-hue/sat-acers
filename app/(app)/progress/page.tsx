import type { Metadata } from "next";
import { ProgressView } from "@/components/ProgressView";

export const metadata: Metadata = { title: "Progress — SAT Acers" };

export default function ProgressPage() {
  return <ProgressView />;
}
