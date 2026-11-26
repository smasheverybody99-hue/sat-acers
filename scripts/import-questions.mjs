#!/usr/bin/env node
/**
 * Savollarni CSV yoki JSON fayldan data/questions.json ga import qiladi.
 *
 *   npm run import -- path/to/file.csv
 *   npm run import -- path/to/file.json --replace     (eski savollarni o'chirib, faqat yangilarini qoldiradi)
 *   npm run import -- path/to/file.csv --dry-run      (faqat tekshiradi, hech narsa yozmaydi)
 *
 * CSV ustunlari (birinchi qator — sarlavha):
 *   id, section, domain, skill, difficulty, type, passage, stem,
 *   choice_a, choice_b, choice_c, choice_d, answer, explanation_uz, explanation_en
 *
 *   section:    math | rw
 *   difficulty: easy | medium | hard
 *   type:       mcq | spr
 *   answer:     mcq uchun A/B/C/D, spr uchun javob(lar) "|" bilan ajratilgan, masalan: 2.5|5/2
 *
 * JSON: Question obyektlari massivi (lib/types.ts dagi format), yoki yuqoridagi CSV ustunlari bilan bir xil
 * kalitli obyektlar massivi.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "questions.json");

const DOMAINS = {
  math: ["Algebra", "Advanced Math", "Problem-Solving and Data Analysis", "Geometry and Trigonometry"],
  rw: ["Information and Ideas", "Craft and Structure", "Expression of Ideas", "Standard English Conventions"],
};

// ---------- CSV ----------
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f !== "")) rows.push(row);

  const [header, ...body] = rows;
  const keys = header.map((h) => h.trim().toLowerCase());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

// ---------- Normalizatsiya ----------
function fromFlat(r) {
  const type = (r.type || (r.choice_a ? "mcq" : "spr")).toLowerCase();
  const q = {
    id: r.id,
    section: (r.section || "").toLowerCase(),
    domain: r.domain,
    skill: r.skill || "",
    difficulty: (r.difficulty || "medium").toLowerCase(),
    type,
    stem: r.stem,
    explanation_uz: r.explanation_uz || "",
    explanation_en: r.explanation_en || "",
  };
  if (r.passage) q.passage = r.passage;
  if (type === "mcq") {
    q.choices = [r.choice_a, r.choice_b, r.choice_c, r.choice_d].filter((c) => c !== undefined && c !== "");
    const a = String(r.answer).trim().toUpperCase();
    q.answer = /^[A-D]$/.test(a) ? a.charCodeAt(0) - 65 : Number(a);
  } else {
    q.answer = String(r.answer).split("|").map((s) => s.trim()).filter(Boolean);
  }
  return q;
}

function normalize(item) {
  // Allaqachon to'g'ri formatda bo'lsa (choices massivi bor yoki answer massiv)
  if (Array.isArray(item.choices) || Array.isArray(item.answer)) {
    const q = { ...item };
    if (q.type === "mcq" && typeof q.answer === "string" && /^[A-Da-d]$/.test(q.answer)) {
      q.answer = q.answer.toUpperCase().charCodeAt(0) - 65;
    }
    return q;
  }
  return fromFlat(item);
}

// ---------- Tekshiruv ----------
function validate(q) {
  const errs = [];
  if (!q.id) errs.push("id yo'q");
  if (!["math", "rw"].includes(q.section)) errs.push(`section noto'g'ri: "${q.section}"`);
  else if (!DOMAINS[q.section].includes(q.domain)) errs.push(`domain noto'g'ri: "${q.domain}"`);
  if (!["easy", "medium", "hard"].includes(q.difficulty)) errs.push(`difficulty noto'g'ri: "${q.difficulty}"`);
  if (!["mcq", "spr"].includes(q.type)) errs.push(`type noto'g'ri: "${q.type}"`);
  if (!q.stem) errs.push("stem bo'sh");
  if (q.type === "mcq") {
    if (!Array.isArray(q.choices) || q.choices.length < 2) errs.push("variantlar yetarli emas");
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.choices?.length ?? 0))
      errs.push(`answer variantlar orasida emas: "${q.answer}"`);
  }
  if (q.type === "spr" && (!Array.isArray(q.answer) || q.answer.length === 0)) errs.push("spr javobi yo'q");
  if (!q.explanation_uz && !q.explanation_en) errs.push("tushuntirish yo'q (ogohlantirish)");
  return errs;
}

// ---------- Main ----------
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const replace = args.includes("--replace");
const dryRun = args.includes("--dry-run");

if (!file) {
  console.error("Foydalanish: npm run import -- <fayl.csv|fayl.json> [--replace] [--dry-run]");
  process.exit(1);
}

const text = fs.readFileSync(file, "utf8");
const rawItems = file.toLowerCase().endsWith(".csv") ? parseCSV(text) : JSON.parse(text);
if (!Array.isArray(rawItems)) {
  console.error("Fayl ichida savollar massivi bo'lishi kerak.");
  process.exit(1);
}

const good = [];
let bad = 0;
let warned = 0;
rawItems.forEach((item, i) => {
  const q = normalize(item);
  const errs = validate(q);
  const fatal = errs.filter((e) => !e.includes("ogohlantirish"));
  if (fatal.length) {
    bad++;
    console.warn(`✗ ${i + 1}-qator (${q.id || "id yo'q"}): ${fatal.join("; ")}`);
  } else {
    if (errs.length) { warned++; console.warn(`! ${q.id}: ${errs.join("; ")}`); }
    good.push(q);
  }
});

const existing = replace || !fs.existsSync(OUT) ? [] : JSON.parse(fs.readFileSync(OUT, "utf8"));
const byId = new Map(existing.map((q) => [q.id, q]));
let updated = 0;
for (const q of good) {
  if (byId.has(q.id)) updated++;
  byId.set(q.id, q);
}
const merged = [...byId.values()];

console.log(
  `\nO'qildi: ${rawItems.length} · to'g'ri: ${good.length} · xato: ${bad} · ogohlantirish: ${warned}` +
    `\nYangi: ${good.length - updated} · yangilangan: ${updated} · jami bazada: ${merged.length}`
);

if (dryRun) {
  console.log("--dry-run: hech narsa yozilmadi.");
} else {
  fs.writeFileSync(OUT, JSON.stringify(merged, null, 2) + "\n");
  console.log(`✓ Yozildi: ${path.relative(process.cwd(), OUT)}`);
}
