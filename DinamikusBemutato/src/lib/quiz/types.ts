export type QuizOption = {
  id: number | string;
  text: string;
};
export type MatchPairs = {
  left: string[];
  right: string[];
};
export type AnswerValue =
  | number
  | string
  | boolean
  | (number | string)[]
  | Record<string, unknown>;
export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'match_pairs';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuizQuestion = {
  id: string | number;
  topic: string;
  type: QuestionType;
  prompt: string;
  options?: QuizOption[];
  pairs?: MatchPairs;
  answer: AnswerValue;
  explanation?: string;
  difficulty?: Difficulty;
};
export type QuizSet = {
  version: string;
  source?: string;
  language: 'hu';
  questions: QuizQuestion[];
};
