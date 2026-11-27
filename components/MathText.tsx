import { Fragment, type ReactNode } from "react";

/**
 * Oddiy matndagi matematik yozuvni chiroyli ko'rsatadi:
 *   a/b, (x + 1)/(x − 2)  → ustma-ust kasr
 *   x^(3/2), 2^x          → daraja
 *   √(2x + 5), ∛(x²)      → ildiz ustida chiziq
 * Bo'sh joy bilan ajratilgan "/" (masalan "12 / 4") o'zgarmaydi.
 */
const GROUP = String.raw`\((?:[^()]|\([^()]*\))*\)`;
const ATOM = String.raw`[A-Za-z0-9.π²³⁴⁵⁶⁷⁸⁹⁰¹]+`;
const OPERAND = `(?:${GROUP}|${ATOM})`;
const SOURCE = (
  [
    String.raw`\^(${GROUP})`, // 1: ^(...)
    String.raw`\^([A-Za-z0-9]+)`, // 2: ^x
    String.raw`([√∛])(${GROUP})`, // 3,4: √(...)
    `(${OPERAND})/(${OPERAND})`, // 5,6: a/b
  ].join("|")
);

const strip = (s: string) => (s.startsWith("(") && s.endsWith(")") ? s.slice(1, -1) : s);

export function renderMath(text: string, keyPrefix = "m"): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  // Har chaqiruvda yangi RegExp: rekursiya tashqi siklning lastIndex'ini buzmasligi uchun
  const RE = new RegExp(SOURCE, "g");
  let m: RegExpExecArray | null;
  while ((m = RE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyPrefix}-${i++}`;
    if (m[1] !== undefined) {
      out.push(<sup key={k}>{renderMath(strip(m[1]), k)}</sup>);
    } else if (m[2] !== undefined) {
      out.push(<sup key={k}>{m[2]}</sup>);
    } else if (m[3] !== undefined) {
      out.push(
        <span key={k} className="radical">
          <span className="radical-sign">{m[3]}</span>
          <span className="radicand">{renderMath(strip(m[4]), k)}</span>
        </span>
      );
    } else {
      out.push(
        <span key={k} className="frac" role="math" aria-label={`${m[5]} / ${m[6]}`}>
          <span className="num">{renderMath(strip(m[5]), k + "n")}</span>
          <span className="den">{renderMath(strip(m[6]), k + "d")}</span>
        </span>
      );
    }
    last = RE.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function MathText({ text }: { text: string }) {
  return <>{renderMath(text)}</>;
}

/**
 * Matn ichidagi "A — B — C" qatorlarini haqiqiy jadvalga aylantiradi.
 * Jadvaldan oldingi qator sarlavha (caption) bo'ladi. Birinchi qatorda raqam bo'lmasa — ustun nomlari.
 */
export function RichText({ text, math = false }: { text: string; math?: boolean }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let buf: string[] = [];
  let i = 0;
  const flushText = () => {
    if (!buf.length) return;
    const t = buf.join("\n").replace(/^\n+|\n+$/g, "");
    if (t) blocks.push(<div key={`t${i++}`} className="rt-text">{math ? renderMath(t) : t}</div>);
    buf = [];
  };
  for (let li = 0; li < lines.length; li++) {
    if (lines[li].includes(" — ")) {
      // jadval bloki
      let caption: string | undefined;
      const prev = buf.length ? buf[buf.length - 1].trim() : "";
      if (prev && !prev.includes(" — ") && prev.length < 90) {
        caption = prev;
        buf.pop();
      }
      flushText();
      const rows: string[][] = [];
      while (li < lines.length && lines[li].includes(" — ")) {
        rows.push(lines[li].split(" — ").map((c) => c.trim()));
        li++;
      }
      li--;
      const hasHeader = rows.length > 1 && !/\d/.test(rows[0].slice(1).join(" "));
      const head = hasHeader ? rows[0] : null;
      const body = hasHeader ? rows.slice(1) : rows;
      blocks.push(
        <figure key={`tb${i++}`} className="data-table">
          {caption && <figcaption>{caption}</figcaption>}
          <table>
            {head && (
              <thead>
                <tr>{head.map((c, ci) => <th key={ci}>{c}</th>)}</tr>
              </thead>
            )}
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (ci === 0 ? <th key={ci} scope="row">{math ? renderMath(c) : c}</th> : <td key={ci}>{math ? renderMath(c) : c}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      );
    } else {
      buf.push(lines[li]);
    }
  }
  flushText();
  return <>{blocks.map((b, k) => <Fragment key={k}>{b}</Fragment>)}</>;
}
