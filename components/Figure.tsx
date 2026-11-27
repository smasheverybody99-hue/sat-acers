import type { Figure as FigureSpec } from "@/lib/types";

/** SAT uslubidagi koordinata tekisligi: oq fon, kulrang to'r, qora chiziqlar */
export function Figure({ spec }: { spec: FigureSpec }) {
  const W = 320;
  const H = 320;
  const pad = 22;
  const [x0, x1] = spec.x;
  const [y0, y1] = spec.y;
  const step = spec.step ?? 2;
  const sx = (x: number) => pad + ((x - x0) / (x1 - x0)) * (W - 2 * pad);
  const sy = (y: number) => H - pad - ((y - y0) / (y1 - y0)) * (H - 2 * pad);
  const inY = (y: number) => y >= y0 - 0.5 && y <= y1 + 0.5;

  const curve = (f: (x: number) => number) => {
    const pts: string[] = [];
    const n = 160;
    let pen = false;
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const y = f(x);
      if (!inY(y) || !Number.isFinite(y)) {
        pen = false;
        continue;
      }
      pts.push(`${pen ? "L" : "M"}${sx(x).toFixed(1)},${sy(Math.max(y0, Math.min(y1, y))).toFixed(1)}`);
      pen = true;
    }
    return pts.join(" ");
  };

  const xs: number[] = [];
  for (let x = Math.ceil(x0); x <= x1; x++) xs.push(x);
  const ys: number[] = [];
  for (let y = Math.ceil(y0); y <= y1; y++) ys.push(y);

  return (
    <div className="figure">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Koordinata tekisligidagi grafik">
        <rect x="0" y="0" width={W} height={H} fill="#fff" rx="8" />
        {xs.map((x) => (
          <line key={`gx${x}`} x1={sx(x)} x2={sx(x)} y1={sy(y0)} y2={sy(y1)} stroke="#e5e7eb" strokeWidth="1" />
        ))}
        {ys.map((y) => (
          <line key={`gy${y}`} y1={sy(y)} y2={sy(y)} x1={sx(x0)} x2={sx(x1)} stroke="#e5e7eb" strokeWidth="1" />
        ))}
        {/* o'qlar */}
        {x0 <= 0 && x1 >= 0 && <line x1={sx(0)} x2={sx(0)} y1={sy(y0)} y2={sy(y1)} stroke="#111827" strokeWidth="1.5" />}
        {y0 <= 0 && y1 >= 0 && <line x1={sx(x0)} x2={sx(x1)} y1={sy(0)} y2={sy(0)} stroke="#111827" strokeWidth="1.5" />}
        {xs.filter((x) => x !== 0 && x % step === 0).map((x) => (
          <text key={`tx${x}`} x={sx(x)} y={sy(Math.max(y0, Math.min(0, y1))) + 14} fontSize="10" textAnchor="middle" fill="#374151">{x}</text>
        ))}
        {ys.filter((y) => y !== 0 && y % step === 0).map((y) => (
          <text key={`ty${y}`} x={sx(Math.max(x0, Math.min(0, x1))) - 6} y={sy(y) + 3.5} fontSize="10" textAnchor="end" fill="#374151">{y}</text>
        ))}
        <text x={sx(x1) - 4} y={sy(Math.max(y0, Math.min(0, y1))) - 6} fontSize="12" fontStyle="italic" fill="#111827" textAnchor="end">x</text>
        <text x={sx(Math.max(x0, Math.min(0, x1))) + 6} y={sy(y1) + 12} fontSize="12" fontStyle="italic" fill="#111827">y</text>
        {x0 <= 0 && x1 >= 0 && y0 <= 0 && y1 >= 0 && (
          <text x={sx(0) - 5} y={sy(0) + 13} fontSize="10" fill="#374151" textAnchor="end">O</text>
        )}

        {spec.lines?.map((l, i) => <path key={`l${i}`} d={curve((x) => l.m * x + l.b)} fill="none" stroke="#111827" strokeWidth="2" />)}
        {spec.vlines?.map((v, i) => <line key={`v${i}`} x1={sx(v)} x2={sx(v)} y1={sy(y0)} y2={sy(y1)} stroke="#111827" strokeWidth="2" />)}
        {spec.parabolas?.map((p, i) => <path key={`p${i}`} d={curve((x) => p.a * (x - p.h) ** 2 + p.k)} fill="none" stroke="#111827" strokeWidth="2" />)}
        {spec.exps?.map((e, i) => <path key={`e${i}`} d={curve((x) => e.a * e.b ** x)} fill="none" stroke="#111827" strokeWidth="2" />)}
        {spec.points?.map((p, i) => (
          <g key={`pt${i}`}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r="4" fill="#111827" />
            {p.label && <text x={sx(p.x) + 7} y={sy(p.y) - 7} fontSize="12" fontWeight="700" fill="#111827">{p.label}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
}
