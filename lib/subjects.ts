// Static metadata describing each subject's visual identity. The `themeKey`
// must match a `color_theme` value stored in the `subjects` table (see
// supabase/seed.sql) and a token defined in app/globals.css.

export type SubjectThemeKey =
  | "maths"
  | "english"
  | "biology"
  | "chemistry"
  | "physics"
  | "science"
  | "computer-science"
  | "geography"
  | "history"
  | "religious-studies"
  | "business"
  | "languages";

interface SubjectTheme {
  base: string;
  soft: string;
  gradient: string;
}

/** Tailwind class fragments per subject theme, backed by CSS vars in globals.css. */
export const SUBJECT_THEMES: Record<SubjectThemeKey, SubjectTheme> = {
  maths: { base: "text-maths bg-maths", soft: "bg-maths-soft", gradient: "from-maths to-maths-light" },
  english: { base: "text-english bg-english", soft: "bg-english-soft", gradient: "from-english to-english-light" },
  biology: { base: "text-biology bg-biology", soft: "bg-biology-soft", gradient: "from-biology to-biology-light" },
  chemistry: { base: "text-chemistry bg-chemistry", soft: "bg-chemistry-soft", gradient: "from-chemistry to-chemistry-light" },
  physics: { base: "text-physics bg-physics", soft: "bg-physics-soft", gradient: "from-physics to-physics-light" },
  science: { base: "text-science bg-science", soft: "bg-science-soft", gradient: "from-science to-science-light" },
  "computer-science": {
    base: "text-computer-science bg-computer-science",
    soft: "bg-computer-science-soft",
    gradient: "from-computer-science to-computer-science-light",
  },
  geography: { base: "text-geography bg-geography", soft: "bg-geography-soft", gradient: "from-geography to-geography-light" },
  history: { base: "text-history bg-history", soft: "bg-history-soft", gradient: "from-history to-history-light" },
  "religious-studies": {
    base: "text-religious-studies bg-religious-studies",
    soft: "bg-religious-studies-soft",
    gradient: "from-religious-studies to-religious-studies-light",
  },
  business: { base: "text-business bg-business", soft: "bg-business-soft", gradient: "from-business to-business-light" },
  languages: { base: "text-languages bg-languages", soft: "bg-languages-soft", gradient: "from-languages to-languages-light" },
};

export function getSubjectTheme(themeKey: string): SubjectTheme {
  return SUBJECT_THEMES[themeKey as SubjectThemeKey] ?? SUBJECT_THEMES.maths;
}

export const YEAR_GROUP_LABELS: Record<string, string> = {
  year_10: "Year 10",
  year_11: "Year 11",
};

export const GCSE_GRADES = [9, 8, 7, 6, 5, 4, 3, 2, 1] as const;
