import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";

export const metadata: Metadata = { title: "Dashboard — SAT Acers" };

export default function DashboardPage() {
  return <Dashboard />;
}
