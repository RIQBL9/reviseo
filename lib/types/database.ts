// Hand-written types mirroring supabase/migrations/0001_init_schema.sql.
// If the schema changes, update this file (and ideally later replace it with
// `supabase gen types typescript` once the Supabase CLI is available).

export type YearGroup = "year_10" | "year_11";

export type MasteryLevel =
  | "not_started"
  | "learning"
  | "improving"
  | "confident"
  | "mastered";

export type QuestionType = "multiple_choice" | "short_answer";

export type RevisionActivityType = "flashcards" | "quiz" | "practice_questions";

export type FriendshipStatus = "pending" | "accepted" | "declined" | "blocked";

export type FlashcardConfidence = "low" | "medium" | "high";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          year_group: YearGroup | null;
          total_xp: number;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          daily_xp_goal: number;
          onboarding_completed: boolean;
          onboarding_step: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      subjects: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          icon: string;
          color_theme: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subjects"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["subjects"]["Row"]>;
      };
      exam_boards: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["exam_boards"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["exam_boards"]["Row"]>;
      };
      subject_exam_boards: {
        Row: {
          id: string;
          subject_id: string;
          exam_board_id: string;
          specification_code: string | null;
          specification_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subject_exam_boards"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["subject_exam_boards"]["Row"]>;
      };
      topics: {
        Row: {
          id: string;
          subject_exam_board_id: string;
          parent_topic_id: string | null;
          slug: string;
          name: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["topics"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["topics"]["Row"]>;
      };
      flashcards: {
        Row: {
          id: string;
          topic_id: string;
          question: string;
          answer: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["flashcards"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["flashcards"]["Row"]>;
      };
      questions: {
        Row: {
          id: string;
          topic_id: string;
          question_type: QuestionType;
          prompt: string;
          options: QuestionOption[] | null;
          correct_answer: string;
          explanation: string | null;
          difficulty: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["questions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["questions"]["Row"]>;
      };
      user_subjects: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          exam_board_id: string;
          target_grade: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_subjects"]["Row"]> & {
          user_id: string;
          subject_id: string;
          exam_board_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_subjects"]["Row"]>;
      };
      user_topic_progress: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string;
          mastery_score: number;
          mastery_level: MasteryLevel;
          questions_answered: number;
          questions_correct: number;
          flashcards_reviewed: number;
          last_revised_at: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_topic_progress"]["Row"]> & {
          user_id: string;
          topic_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_topic_progress"]["Row"]>;
      };
      revision_sessions: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string;
          activity_type: RevisionActivityType;
          items_total: number;
          items_correct: number;
          duration_seconds: number;
          xp_earned: number;
          started_at: string;
          completed_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["revision_sessions"]["Row"]> & {
          user_id: string;
          topic_id: string;
          activity_type: RevisionActivityType;
        };
        Update: Partial<Database["public"]["Tables"]["revision_sessions"]["Row"]>;
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string;
          revision_session_id: string;
          score: number;
          total_questions: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["quiz_attempts"]["Row"]> & {
          user_id: string;
          topic_id: string;
          revision_session_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_attempts"]["Row"]>;
      };
      quiz_answers: {
        Row: {
          id: string;
          quiz_attempt_id: string;
          question_id: string;
          user_answer: string | null;
          is_correct: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["quiz_answers"]["Row"]> & {
          quiz_attempt_id: string;
          question_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_answers"]["Row"]>;
      };
      flashcard_reviews: {
        Row: {
          id: string;
          user_id: string;
          flashcard_id: string;
          revision_session_id: string | null;
          confidence: FlashcardConfidence;
          reviewed_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["flashcard_reviews"]["Row"]> & {
          user_id: string;
          flashcard_id: string;
          confidence: FlashcardConfidence;
        };
        Update: Partial<Database["public"]["Tables"]["flashcard_reviews"]["Row"]>;
      };
      xp_events: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          reason: string;
          revision_session_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["xp_events"]["Row"]> & {
          user_id: string;
          amount: number;
          reason: string;
        };
        Update: Partial<Database["public"]["Tables"]["xp_events"]["Row"]>;
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_key: string;
          earned_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_achievements"]["Row"]> & {
          user_id: string;
          achievement_key: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_achievements"]["Row"]>;
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: FriendshipStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["friendships"]["Row"]> & {
          requester_id: string;
          addressee_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["friendships"]["Row"]>;
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
