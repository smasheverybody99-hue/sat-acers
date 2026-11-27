import type { Metadata } from "next";
import { Login } from "@/components/Login";

export const metadata: Metadata = { title: "Kirish — SAT Acers" };

export default function LoginPage() {
  return <Login />;
}
