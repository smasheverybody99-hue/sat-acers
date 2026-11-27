export type Section = "math" | "rw";
export type Difficulty = "easy" | "medium" | "hard";

/** Koordinata tekisligidagi chizma (SVG). y = a(x − h)² + k — parabola; y = a·b^x — eksponenta */
export interface Figure {
  x: [number, number];
  y: [number, number];
  lines?: { m: number; b: number }[];
  vlines?: number[];
  parabolas?: { a: number; h: number; k: number }[];
  exps?: { a: number; b: number }[];
  points?: { x: number; y: number; label?: string }[];
  /** Har nechta birlikda son yoziladi (standart: 2) */
  step?: number;
}

export interface Question {
  id: string;
  section: Section;
  domain: string;
  skill: string;
  difficulty: Difficulty;
  /** mcq = variantli, spr = javobni o'zi yozadi (faqat Math) */
  type: "mcq" | "spr";
  passage?: string;
  figure?: Figure;
  stem: string;
  choices?: string[];
  /** mcq: to'g'ri variant indeksi (0 = A). spr: qabul qilinadigan javoblar ro'yxati */
  answer: number | string[];
  explanation_uz: string;
  explanation_en: string;
}

export const DOMAINS: Record<Section, string[]> = {
  math: [
    "Algebra",
    "Advanced Math",
    "Problem-Solving and Data Analysis",
    "Geometry and Trigonometry",
  ],
  rw: [
    "Information and Ideas",
    "Craft and Structure",
    "Expression of Ideas",
    "Standard English Conventions",
  ],
};

export const SECTION_LABEL: Record<Section, string> = {
  math: "Math",
  rw: "Reading & Writing",
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Oson",
  medium: "O'rta",
  hard: "Qiyin",
};
