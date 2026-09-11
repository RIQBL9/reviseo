// Static content for the public landing page only. Real subject/exam board
// data for onboarding and the app itself is always read from Supabase
// (see supabase/seed.sql) — this file exists purely so the marketing page
// renders instantly without a database round trip, and still renders
// something reasonable before Supabase is configured.

import type { SubjectThemeKey } from "@/lib/subjects";

export interface MarketingSubject {
  name: string;
  icon: string;
  theme: SubjectThemeKey;
}

export const MARKETING_SUBJECTS: MarketingSubject[] = [
  { name: "Mathematics", icon: "Sigma", theme: "maths" },
  { name: "Biology", icon: "Dna", theme: "biology" },
  { name: "Chemistry", icon: "FlaskConical", theme: "chemistry" },
  { name: "Physics", icon: "Atom", theme: "physics" },
  { name: "English Language", icon: "PenLine", theme: "english" },
  { name: "Computer Science", icon: "Cpu", theme: "computer-science" },
  { name: "Geography", icon: "Globe2", theme: "geography" },
  { name: "History", icon: "Landmark", theme: "history" },
];

export const EXAM_BOARDS = ["AQA", "Pearson Edexcel", "OCR", "WJEC / Eduqas"];
