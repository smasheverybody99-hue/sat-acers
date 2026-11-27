"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Like Bluebook: opening Desmos splits the screen, calculator on the left and question on the right.
 * Drag the divider to change the ratio. The calculator stays in memory when closed,
 * so graphs aren't lost.
 */
export function DesmosSplit({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [pct, setPct] = useState(50);
  const wrap = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    function move(e: PointerEvent) {
      if (!dragging.current || !wrap.current) return;
      const r = wrap.current.getBoundingClientRect();
      const vertical = window.innerWidth <= 760;
      const p = vertical ? ((e.clientY - r.top) / r.height) * 100 : ((e.clientX - r.left) / r.width) * 100;
      setPct(Math.min(75, Math.max(25, p)));
    }
    function up() {
      dragging.current = false;
      document.body.classList.remove("dragging");
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div className={`split-wrap ${open ? "with-calc" : ""}`} ref={wrap}>
      {mounted && (
        <section className="calc-pane" style={{ display: open ? "flex" : "none", flexBasis: `${pct}%` }} aria-label="Desmos calculator">
          <div className="calc-head">
            <span>🧮 Desmos Graphing Calculator</span>
            <div className="calc-actions">
              <button onClick={() => setPct(pct >= 60 ? 50 : 65)} title="Resize">{pct >= 60 ? "⇤" : "⇥"}</button>
              <button onClick={onClose} title="Close">✕</button>
            </div>
          </div>
          <iframe
            src="https://www.desmos.com/calculator?lang=en"
            title="Desmos Graphing Calculator"
            className="calc-frame"
            allow="clipboard-write"
          />
        </section>
      )}
      {open && (
        <div
          className="split-divider"
          role="separator"
          aria-orientation="vertical"
          onPointerDown={() => {
            dragging.current = true;
            document.body.classList.add("dragging");
          }}
        >
          <span />
        </div>
      )}
      <div className="split-main">{children}</div>
    </div>
  );
}
