"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bluebook'dagidek sayt ichidagi Desmos kalkulyatori.
 * Sarlavhadan ushlab suriladi, pastki o'ng burchakdan kattalashtiriladi.
 * Yopilganda ham iframe saqlanib qoladi — kiritilgan grafiklar yo'qolmaydi.
 */
export function DesmosPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ x: 24, y: 80 });
  const [wide, setWide] = useState(false);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    if (open && !mounted) {
      // Birinchi ochilishda ekranning o'ng tomoniga joylashadi
      setPos({ x: Math.max(8, window.innerWidth - 444), y: 80 });
      setMounted(true);
    }
  }, [open, mounted]);

  useEffect(() => {
    function move(e: PointerEvent) {
      if (!drag.current) return;
      const x = Math.min(Math.max(0, e.clientX - drag.current.dx), window.innerWidth - 120);
      const y = Math.min(Math.max(0, e.clientY - drag.current.dy), window.innerHeight - 60);
      setPos({ x, y });
    }
    function up() {
      drag.current = null;
      document.body.classList.remove("dragging");
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`desmos-panel ${wide ? "wide" : ""}`}
      style={{ left: pos.x, top: pos.y, display: open ? "flex" : "none" }}
      role="dialog"
      aria-label="Desmos kalkulyatori"
    >
      <div
        className="desmos-head"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button, a")) return;
          drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
          document.body.classList.add("dragging");
        }}
      >
        <span>⠿ Desmos kalkulyatori</span>
        <div className="desmos-actions">
          <a href="https://www.desmos.com/calculator" target="_blank" rel="noopener noreferrer" title="Yangi oynada ochish">↗</a>
          <button onClick={() => setWide(!wide)} title={wide ? "Kichraytirish" : "Kattalashtirish"}>{wide ? "⤡" : "⤢"}</button>
          <button onClick={onClose} title="Yopish">✕</button>
        </div>
      </div>
      <iframe
        src="https://www.desmos.com/calculator?lang=en"
        title="Desmos Graphing Calculator"
        className="desmos-frame"
        allow="clipboard-write"
      />
    </div>
  );
}
