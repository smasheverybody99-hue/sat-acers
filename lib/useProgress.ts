"use client";

import { useEffect, useState } from "react";
import { loadProgress, type Progress } from "./progress";

/** Progress'ni o'qiydi va boshqa komponentlar yangilaganda avtomatik yangilanadi */
export function useProgress(): Progress | null {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    const update = () => setProgress(loadProgress());
    update();
    window.addEventListener("acers:progress", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("acers:progress", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return progress;
}
