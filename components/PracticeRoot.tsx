"use client";

import { useEffect, useState } from "react";
import { BankBrowser } from "./BankBrowser";
import { Practice, type Filters } from "./Practice";
import { dailyIds } from "@/lib/stats";
import { dayKey, loadProgress } from "@/lib/progress";
import type { Difficulty, Section } from "@/lib/types";

type Mode =
  | { kind: "browse" }
  | { kind: "filtered"; filters: Partial<Filters> }
  | { kind: "daily"; ids: string[] };

/** /practice — no params: topic list; with params: practice session */
export function PracticeRoot() {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("daily")) {
      setMode({ kind: "daily", ids: dailyIds(loadProgress(), dayKey()) });
      return;
    }
    const f: Partial<Filters> = {};
    const section = sp.get("section");
    if (section === "rw" || section === "math") f.section = section as Section;
    if (sp.get("domain")) f.domain = sp.get("domain")!;
    if (sp.get("skill")) f.skill = sp.get("skill")!;
    const d = sp.get("difficulty");
    if (d === "easy" || d === "medium" || d === "hard") f.difficulty = d as Difficulty;
    const st = sp.get("status");
    if (st === "new" || st === "wrong") f.status = st;
    setMode(Object.keys(f).length ? { kind: "filtered", filters: f } : { kind: "browse" });
  }, []);

  if (!mode) return null;
  if (mode.kind === "browse") return <BankBrowser />;
  if (mode.kind === "daily") return <Practice ids={mode.ids} title="Daily 5" />;
  return <Practice initial={mode.filters} />;
}
