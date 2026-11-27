"use client";

import { useEffect, useState } from "react";
import { loadProgress, type Progress } from "./progress";

/** Reads progress and re-renders when other components update it */
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
