#!/usr/bin/env node
/**
 * Imports questions from a CSV or JSON file into data/questions.json.
 *
 *   npm run import -- path/to/file.csv
 *   npm run import -- path/to/file.json --replace     (removes existing questions, keeps only the new ones)
 *   npm run import -- path/to/file.csv --dry-run      (validates only, writes nothing)
 *
 * CSV columns (first row is the header):
 *   id, section, domain, skill, difficulty, type, passage, stem,
 *   choice_a, choice_b, choice_c, choice_d, answer, explanation_en
 *
 *   section:    math | rw
 *   difficulty: easy | medium | hard
 *   type:       mcq | spr
 *   answer:     A/B/C/D for mcq; for spr, accepted answers separated by "|", e.g. 2.5|5/2
 *
 * JSON: an array of Question objects (the format in lib/types.ts), or an array of objects with the same
 * keys as the CSV columns above.
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

// ---------- Normalization ----------
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
  // Already in the right format (has a choices array or an answer array)
  if (Array.isArray(item.choices) || Array.isArray(item.answer)) {
    const q = { ...item };
    if (q.type === "mcq" && typeof q.answer === "string" && /^[A-Da-d]$/.test(q.answer)) {
      q.answer = q.answer.toUpperCase().charCodeAt(0) - 65;
    }
    return q;
  }
  return fromFlat(item);
}

// ---------- Validation ----------
function validate(q) {
  const errs = [];
  if (!q.id) errs.push("missing id");
  if (!["math", "rw"].includes(q.section)) errs.push(`invalid section: "${q.section}"`);
  else if (!DOMAINS[q.section].includes(q.domain)) errs.push(`invalid domain: "${q.domain}"`);
  if (!["easy", "medium", "hard"].includes(q.difficulty)) errs.push(`invalid difficulty: "${q.difficulty}"`);
  if (!["mcq", "spr"].includes(q.type)) errs.push(`invalid type: "${q.type}"`);
  if (!q.stem) errs.push("empty stem");
  if (q.type === "mcq") {
    if (!Array.isArray(q.choices) || q.choices.length < 2) errs.push("not enough choices");
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.choices?.length ?? 0))
      errs.push(`answer is not one of the choices: "${q.answer}"`);
  }
  if (q.type === "spr" && (!Array.isArray(q.answer) || q.answer.length === 0)) errs.push("missing spr answer");
  if (!q.explanation_en) errs.push("missing explanation (warning)");
  return errs;
}

// ---------- Main ----------
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const replace = args.includes("--replace");
const dryRun = args.includes("--dry-run");

if (!file) {
  console.error("Usage: npm run import -- <file.csv|file.json> [--replace] [--dry-run]");
  process.exit(1);
}

const text = fs.readFileSync(file, "utf8");
const rawItems = file.toLowerCase().endsWith(".csv") ? parseCSV(text) : JSON.parse(text);
if (!Array.isArray(rawItems)) {
  console.error("The file must contain an array of questions.");
  process.exit(1);
}

const good = [];
let bad = 0;
let warned = 0;
rawItems.forEach((item, i) => {
  const q = normalize(item);
  const errs = validate(q);
  const fatal = errs.filter((e) => !e.includes("warning"));
  if (fatal.length) {
    bad++;
    console.warn(`✗ row ${i + 1} (${q.id || "no id"}): ${fatal.join("; ")}`);
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
  `\nRead: ${rawItems.length} · valid: ${good.length} · errors: ${bad} · warnings: ${warned}` +
    `\nNew: ${good.length - updated} · updated: ${updated} · total in bank: ${merged.length}`
);

if (dryRun) {
  console.log("--dry-run: nothing was written.");
} else {
  fs.writeFileSync(OUT, JSON.stringify(merged, null, 2) + "\n");
  console.log(`✓ Wrote ${path.relative(process.cwd(), OUT)}`);
}
