import { describe, it, expect } from 'vitest';
import {
	TrueFalseQuestion,
	SingleChoiceQuestion,
	MultipleChoiceQuestion,
	MatchPairsQuestion,
	Quiz,
	createQuestion
} from './model';
import type { QuizQuestion, QuizSet } from './types';

describe('TrueFalseQuestion', () => {
	it('should validate correct answer', () => {
		const q: QuizQuestion = {
			id: 1,
			topic: 'Test',
			type: 'true_false',
			prompt: 'Is this true?',
			answer: true
		};

		const question = new TrueFalseQuestion(q);
		expect(question.validate(true)).toBe(true);
		expect(question.validate(false)).toBe(false);
	});
});

describe('SingleChoiceQuestion', () => {
	const options = [
		{ id: 1, text: 'Option A' },
		{ id: 2, text: 'Option B' },
		{ id: 3, text: 'Option C' }
	];

	it('should validate correct answer with numeric id', () => {
		const q: QuizQuestion = {
			id: 1,
			topic: 'Test',
			type: 'single_choice',
			prompt: 'Pick one',
			options,
			answer: 2
		};

		const question = new SingleChoiceQuestion(q);
		expect(question.validate(2)).toBe(true);
		expect(question.validate(1)).toBe(false);
	});
});

describe('MultipleChoiceQuestion', () => {
	const options = [
		{ id: 1, text: 'Option A' },
		{ id: 2, text: 'Option B' },
		{ id: 3, text: 'Option C' },
		{ id: 4, text: 'Option D' }
	];

	it('should validate correct answer', () => {
		const q: QuizQuestion = {
			id: 1,
			topic: 'Test',
			type: 'multiple_choice',
			prompt: 'Pick multiple',
			options,
			answer: [1, 3]
		};

		const question = new MultipleChoiceQuestion(q);
		expect(question.validate([1, 3])).toBe(true);
		expect(question.validate([3, 1])).toBe(true); // Order shouldn't matter
	});

	it('should reject partially correct answer', () => {
		const q: QuizQuestion = {
			id: 1,
			topic: 'Test',
			type: 'multiple_choice',
			prompt: 'Pick multiple',
			options,
			answer: [1, 3]
		};

		const question = new MultipleChoiceQuestion(q);
		expect(question.validate([1])).toBe(false);
		expect(question.validate([1, 3, 4])).toBe(false);
	});
});

describe('MatchPairsQuestion', () => {
	const pairs = {
		left: ['Apple', 'Banana', 'Cherry'],
		right: ['Red', 'Yellow', 'Red']
	};

	it('should validate correct answer', () => {
		const q: QuizQuestion = {
			id: 1,
			topic: 'Test',
			type: 'match_pairs',
			prompt: 'Match the items',
			pairs,
			answer: [0, 1, 0]
		};

		const question = new MatchPairsQuestion(q);
		expect(question.validate([0, 1, 0])).toBe(true);
		expect(question.validate([1, 1, 0])).toBe(false);
	});
});

describe('createQuestion factory', () => {
	it('should create TrueFalseQuestion', () => {
		const q: QuizQuestion = {
			id: 1,
			topic: 'Test',
			type: 'true_false',
			prompt: 'Is this true?',
			answer: true
		};

		const question = createQuestion(q);
		expect(question).toBeInstanceOf(TrueFalseQuestion);
	});

	it('should create MultipleChoiceQuestion', () => {
		const q: QuizQuestion = {
			id: 1,
			topic: 'Test',
			type: 'multiple_choice',
			prompt: 'Pick multiple',
			options: [{ id: 1, text: 'A' }],
			answer: [1]
		};

		const question = createQuestion(q);
		expect(question).toBeInstanceOf(MultipleChoiceQuestion);
	});
});

describe('Quiz', () => {
	const sampleQuizSet: QuizSet = {
		version: '1.0',
		language: 'hu',
		questions: [
			{
				id: 1,
				topic: 'Math',
				type: 'true_false',
				prompt: '2+2=4?',
				answer: true
			},
			{
				id: 2,
				topic: 'Colors',
				type: 'single_choice',
				prompt: 'What is red?',
				options: [
					{ id: 1, text: 'Apple' },
					{ id: 2, text: 'Banana' }
				],
				answer: 1
			}
		]
	};

	it('should create quiz with all questions', () => {
		const quiz = new Quiz(sampleQuizSet);
		expect(quiz.length).toBe(2);
		expect(quiz.version).toBe('1.0');
	});

	it('should get question by index', () => {
		const quiz = new Quiz(sampleQuizSet);

		const q1 = quiz.getQuestion(0);
		expect(q1).toBeInstanceOf(TrueFalseQuestion);

		const q2 = quiz.getQuestion(1);
		expect(q2).toBeInstanceOf(SingleChoiceQuestion);
	});
});
