"use client";

import { useRef } from "react";
import { RichText } from "./MathText";

export type Range2 = [number, number];

function merge(ranges: Range2[]): Range2[] {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const out: Range2[] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else out.push([r[0], r[1]]);
  }
  return out;
}

/**
 * Bo'yaladigan matn: highlighter yoqilganda belgilangan matn sariq bo'ladi,
 * bo'yalgan joyni bosish uni o'chiradi. Jadvalli matnlarda bo'yash o'chiriladi.
 */
export function HighlightPassage({
  text,
  ranges,
  enabled,
  onChange,
}: {
  text: string;
  ranges: Range2[];
  enabled: boolean;
  onChange: (r: Range2[]) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  if (text.includes(" — ")) return <RichText text={text} />;

  function onMouseUp() {
    if (!enabled || !ref.current) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.startContainer) || !ref.current.contains(range.endContainer)) return;
    const pre = document.createRange();
    pre.setStart(ref.current, 0);
    pre.setEnd(range.startContainer, range.startOffset);
    const start = pre.toString().length;
    const end = start + range.toString().length;
    if (end > start) onChange(merge([...ranges, [start, end]]));
    sel.removeAllRanges();
  }

  const parts: React.ReactNode[] = [];
  let pos = 0;
  merge(ranges).forEach(([s, e], i) => {
    if (s > pos) parts.push(text.slice(pos, s));
    parts.push(
      <mark
        key={i}
        className="hl"
        title="O'chirish uchun bosing"
        onClick={() => onChange(ranges.filter((r) => !(r[0] < e && r[1] > s)))}
      >
        {text.slice(s, e)}
      </mark>
    );
    pos = e;
  });
  if (pos < text.length) parts.push(text.slice(pos));

  return (
    <div ref={ref} className={`hl-text ${enabled ? "hl-on" : ""}`} onMouseUp={onMouseUp}>
      {parts}
    </div>
  );
}

/** SAT Math formulalar varag'i (umumiy geometriya formulalari) */
export function ReferenceSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="ref-backdrop" onClick={onClose}>
      <div className="ref-sheet" role="dialog" aria-label="Reference sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ref-head">
          <b>Reference Sheet</b>
          <button onClick={onClose} aria-label="Yopish">✕</button>
        </div>
        <div className="ref-grid">
          <RefItem title="Circle">
            <svg viewBox="0 0 80 60"><circle cx="40" cy="30" r="24" /><line x1="40" y1="30" x2="64" y2="30" /><text x="50" y="26">r</text></svg>
            <p>A = πr²<br />C = 2πr</p>
          </RefItem>
          <RefItem title="Rectangle">
            <svg viewBox="0 0 80 60"><rect x="12" y="14" width="56" height="32" /><text x="38" y="58">ℓ</text><text x="70" y="34">w</text></svg>
            <p>A = ℓw</p>
          </RefItem>
          <RefItem title="Triangle">
            <svg viewBox="0 0 80 60"><polygon points="10,50 70,50 30,10" /><line x1="30" y1="10" x2="30" y2="50" strokeDasharray="3 3" /><text x="33" y="34">h</text><text x="38" y="59">b</text></svg>
            <p>A = ½bh</p>
          </RefItem>
          <RefItem title="Right triangle">
            <svg viewBox="0 0 80 60"><polygon points="14,50 66,50 14,12" /><text x="36" y="59">a</text><text x="4" y="34">b</text><text x="42" y="28">c</text></svg>
            <p>c² = a² + b²</p>
          </RefItem>
          <RefItem title="Special right triangles">
            <svg viewBox="0 0 80 60"><polygon points="10,50 60,50 10,18" /><text x="28" y="59">x√3</text><text x="0" y="36">x</text><text x="36" y="30">2x</text></svg>
            <p>30°–60°–90°: x, x√3, 2x<br />45°–45°–90°: s, s, s√2</p>
          </RefItem>
          <RefItem title="Rectangular prism">
            <svg viewBox="0 0 80 60"><rect x="12" y="20" width="42" height="30" /><polyline points="12,20 26,8 68,8 54,20" /><polyline points="68,8 68,38 54,50" /></svg>
            <p>V = ℓwh</p>
          </RefItem>
          <RefItem title="Cylinder">
            <svg viewBox="0 0 80 60"><ellipse cx="40" cy="12" rx="22" ry="6" /><ellipse cx="40" cy="48" rx="22" ry="6" /><line x1="18" y1="12" x2="18" y2="48" /><line x1="62" y1="12" x2="62" y2="48" /></svg>
            <p>V = πr²h</p>
          </RefItem>
          <RefItem title="Sphere">
            <svg viewBox="0 0 80 60"><circle cx="40" cy="30" r="24" /><ellipse cx="40" cy="30" rx="24" ry="7" strokeDasharray="3 3" /></svg>
            <p>V = (4/3)πr³</p>
          </RefItem>
          <RefItem title="Cone">
            <svg viewBox="0 0 80 60"><polyline points="18,48 40,6 62,48" /><ellipse cx="40" cy="48" rx="22" ry="6" /></svg>
            <p>V = (1/3)πr²h</p>
          </RefItem>
          <RefItem title="Pyramid">
            <svg viewBox="0 0 80 60"><polygon points="12,48 56,48 40,8" /><polyline points="56,48 68,38 40,8" /></svg>
            <p>V = (1/3)ℓwh</p>
          </RefItem>
        </div>
        <ul className="ref-notes">
          <li>The number of degrees of arc in a circle is 360.</li>
          <li>The number of radians of arc in a circle is 2π.</li>
          <li>The sum of the measures in degrees of the angles of a triangle is 180.</li>
        </ul>
      </div>
    </div>
  );
}

function RefItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ref-item">
      {children}
      <small>{title}</small>
    </div>
  );
}
