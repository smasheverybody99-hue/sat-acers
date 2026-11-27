import type { Metadata } from "next";
import { Login } from "@/components/Login";

export const metadata: Metadata = { title: "Sign in — SAT Acers" };

export default function LoginPage() {
  return <Login />;
}
