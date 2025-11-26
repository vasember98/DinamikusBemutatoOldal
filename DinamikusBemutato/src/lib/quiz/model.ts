import type { QuestionDTO, QuestionType, Option, MatchPairs, QuizDTO } from './types';
export abstract class BaseQuestion {
  id: string | number;
  topic: string;
  type: QuestionType;
  prompt: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  protected constructor(dto: QuestionDTO) {
    this.id = dto.id;
    this.topic = dto.topic;
    this.type = dto.type;
    this.prompt = dto.prompt;
    this.explanation = dto.explanation;
    this.difficulty = dto.difficulty;
  }
  abstract validate(userAnswer: unknown): boolean;
}
export class TrueFalseQuestion extends BaseQuestion {
  correct: boolean;
  constructor(dto: QuestionDTO) {
    super(dto);
    if (typeof dto.answer !== 'boolean') throw new Error('TrueFalse answer must be boolean');
    this.correct = dto.answer;
  }
  validate(userAnswer: unknown): boolean {
    return userAnswer === this.correct;
  }
}
export class SingleChoiceQuestion extends BaseQuestion {
  options: Option[];
  correctId: number | string;
  constructor(dto: QuestionDTO) {
    super(dto);
    if (!dto.options) throw new Error('SingleChoice needs options');
    this.options = dto.options;
    if (typeof dto.answer !== 'number' && typeof dto.answer !== 'string') {
      throw new Error('SingleChoice answer must be scalar id');
    }
    this.correctId = dto.answer as number | string;
  }
  validate(userAnswer: unknown): boolean {
    return userAnswer === this.correctId;
  }
}
export class MultipleChoiceQuestion extends BaseQuestion {
  options: Option[];
  correctIds: (number | string)[];
  constructor(dto: QuestionDTO) {
    super(dto);
    if (!dto.options) throw new Error('MultipleChoice needs options');
    this.options = dto.options;
    if (!Array.isArray(dto.answer)) throw new Error('MultipleChoice answer must be array');
    this.correctIds = dto.answer as (number | string)[];
  }
  validate(userAnswer: unknown): boolean {
    if (!Array.isArray(userAnswer)) return false;
    const a = new Set(this.correctIds);
    const b = new Set(userAnswer as (number | string)[]);
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }
}
export class MatchPairsQuestion extends BaseQuestion {
  pairs: MatchPairs;
  solution: number[];
  constructor(dto: QuestionDTO) {
    super(dto);
    if (!dto.pairs) throw new Error('MatchPairs needs pairs');
    if (!Array.isArray(dto.answer)) throw new Error('MatchPairs answer must be array');
    this.pairs = dto.pairs;
    this.solution = dto.answer as number[];
  }
  validate(userAnswer: unknown): boolean {
    if (!Array.isArray(userAnswer)) return false;
    const ans = userAnswer as number[];
    if (ans.length !== this.solution.length) return false;
    return ans.every((v, i) => v === this.solution[i]);
  }
}
export class Quiz {
  version: string;
  language: string;
  source?: string;
  questions: BaseQuestion[];
  constructor(dto: QuizDTO) {
    this.version = dto.version;
    this.language = dto.language;
    this.source = dto.source;
    this.questions = dto.questions.map(createQuestion);
  }
  getQuestion(index: number): BaseQuestion | null {
    if (index < 0 || index >= this.questions.length) return null;
    return this.questions[index];
  }
  get length(): number {
    return this.questions.length;
  }
}
export function createQuestion(dto: QuestionDTO): BaseQuestion {
  switch (dto.type) {
    case 'true_false':
      return new TrueFalseQuestion(dto);
    case 'single_choice':
      return new SingleChoiceQuestion(dto);
    case 'multiple_choice':
      return new MultipleChoiceQuestion(dto);
    case 'match_pairs':
      return new MatchPairsQuestion(dto);
    default:
      throw new Error(`Unknown question type: ${dto.type}`);
  }
}
