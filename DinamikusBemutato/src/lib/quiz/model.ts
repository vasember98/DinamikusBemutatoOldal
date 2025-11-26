import type { QuizQuestion, QuestionType, QuizOption, MatchPairs, QuizSet } from './types';

export abstract class BaseQuestion {
  id: string | number;
  topic: string;
  type: QuestionType;
  prompt: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  
  protected constructor(q: QuizQuestion) {
    this.id = q.id;
    this.topic = q.topic;
    this.type = q.type;
    this.prompt = q.prompt;
    this.explanation = q.explanation;
    this.difficulty = q.difficulty;
  }
  
  abstract validate(userAnswer: unknown): boolean;
}

export class TrueFalseQuestion extends BaseQuestion {
  correct: boolean;
  
  constructor(q: QuizQuestion) {
    super(q);
    
    if (typeof q.answer !== 'boolean') {
      throw new Error('TrueFalse answer must be boolean');
    }
    
    this.correct = q.answer;
  }
  
  validate(userAnswer: unknown): boolean {
    return userAnswer === this.correct;
  }
}

export class SingleChoiceQuestion extends BaseQuestion {
  options: QuizOption[];
  correctId: number | string;
  
  constructor(q: QuizQuestion) {
    super(q);
    
    if (!q.options) {
      throw new Error('SingleChoice needs options');
    }
    
    this.options = q.options;
    
    const answerType = typeof q.answer;
    if (answerType !== 'number' && answerType !== 'string') {
      throw new Error('SingleChoice answer must be scalar id');
    }
    
    this.correctId = q.answer as number | string;
  }
  
  validate(userAnswer: unknown): boolean {
    return userAnswer === this.correctId;
  }
}
export class MultipleChoiceQuestion extends BaseQuestion {
  options: QuizOption[];
  correctIds: (number | string)[];
  
  constructor(q: QuizQuestion) {
    super(q);
    
    if (!q.options) {
      throw new Error('MultipleChoice needs options');
    }
    this.options = q.options;
    
    if (!Array.isArray(q.answer)) {
      throw new Error('MultipleChoice answer must be array');
    }
    
    this.correctIds = q.answer as (number | string)[];
  }
  
  validate(userAnswer: unknown): boolean {
    if (!Array.isArray(userAnswer)) {
      return false;
    }
    
    const correctSet = new Set(this.correctIds);
    const userSet = new Set(userAnswer as (number | string)[]);
    
    if (correctSet.size !== userSet.size) {
      return false;
    }
    
    for (const id of correctSet) {
      if (!userSet.has(id)) {
        return false;
      }
    }
    
    return true;
  }
}

export class MatchPairsQuestion extends BaseQuestion {
  pairs: MatchPairs;
  solution: number[];
  
  constructor(q: QuizQuestion) {
    super(q);
    
    if (!q.pairs) {
      throw new Error('MatchPairs needs pairs');
    }
    
    if (!Array.isArray(q.answer)) {
      throw new Error('MatchPairs answer must be array');
    }
    
    this.pairs = q.pairs;
    this.solution = q.answer as number[];
  }
  
  validate(userAnswer: unknown): boolean {
    if (!Array.isArray(userAnswer)) {
      return false;
    }
    
    const answer = userAnswer as number[];
    
    if (answer.length !== this.solution.length) {
      return false;
    }
    
    for (let idx = 0; idx < this.solution.length; idx++) {
      if (answer[idx] !== this.solution[idx]) {
        return false;
      }
    }
    
    return true;
  }
}
export class Quiz {
  version: string;
  language: string;
  source?: string;
  questions: BaseQuestion[];
  
  constructor(data: QuizSet) {
    this.version = data.version;
    this.language = data.language;
    this.source = data.source;
    
    this.questions = [];
    for (const q of data.questions) {
      this.questions.push(createQuestion(q));
    }
  }
  
  getQuestion(index: number): BaseQuestion | null {
    if (index < 0 || index >= this.questions.length) {
      return null;
    }
    return this.questions[index];
  }
  
  get length(): number {
    return this.questions.length;
  }
}

export function createQuestion(q: QuizQuestion): BaseQuestion {
  const questionType = q.type;
  
  switch (questionType) {
    case 'true_false':
      return new TrueFalseQuestion(q);
      
    case 'single_choice':
      return new SingleChoiceQuestion(q);
      
    case 'multiple_choice':
      return new MultipleChoiceQuestion(q);
      
    case 'match_pairs':
      return new MatchPairsQuestion(q);
      
    default:
      throw new Error(`Unknown question type: ${questionType}`);
  }
}
