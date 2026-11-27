import type { Metadata } from "next";
import { MockList } from "@/components/MockList";

export const metadata: Metadata = { title: "Mock tests — SAT Acers" };

export default function MockListPage() {
  return <MockList />;
}
