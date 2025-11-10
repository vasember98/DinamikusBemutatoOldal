export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'match_pairs';

export interface Option {
  id: number | string;
  text: string;
}

export interface MatchPairs {
  left: string[];
  right: string[];
}

export interface QuestionDTO {
  id: string | number;
  topic: string;
  type: QuestionType;
  prompt: string;
  options?: Option[];
  pairs?: MatchPairs;
  answer: unknown;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizDTO {
  version: string;
  source?: string;
  language: string;
  questions: QuestionDTO[];
}
