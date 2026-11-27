export type Section = "math" | "rw";
export type Difficulty = "easy" | "medium" | "hard";

/** Coordinate-plane figure (SVG). y = a(x − h)² + k is a parabola; y = a·b^x is an exponential */
export interface Figure {
  x: [number, number];
  y: [number, number];
  lines?: { m: number; b: number }[];
  vlines?: number[];
  parabolas?: { a: number; h: number; k: number }[];
  exps?: { a: number; b: number }[];
  points?: { x: number; y: number; label?: string }[];
  /** Label every N units (default: 2) */
  step?: number;
}

export interface Question {
  id: string;
  section: Section;
  domain: string;
  skill: string;
  difficulty: Difficulty;
  /** mcq = multiple choice, spr = student-produced response (Math only) */
  type: "mcq" | "spr";
  passage?: string;
  figure?: Figure;
  stem: string;
  choices?: string[];
  /** mcq: index of the correct choice (0 = A). spr: list of accepted answers */
  answer: number | string[];
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
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
