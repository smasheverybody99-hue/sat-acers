import type { Metadata } from "next";
import { Leaderboard } from "@/components/Leaderboard";

export const metadata: Metadata = { title: "Leaderboard — SAT Acers" };

export default function LeaderboardPage() {
  return <Leaderboard />;
}
