import { db } from '$lib/server/db';
import { quizSets, quizQuestions, quizOptions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { QuizSet } from '$lib/quiz/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Get the latest quiz set (or you can specify a version)
  const latestQuizSet = await db
    .select()
    .from(quizSets)
    .orderBy(quizSets.id)
    .limit(1);

  if (latestQuizSet.length === 0) {
    throw new Error('No quiz set found in database');
  }

  const quizSetId = latestQuizSet[0].id;

  // Get all questions for this quiz set
  const questions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizSetId, quizSetId));

  // Get all options for these questions
  const questionIds = questions.map((q) => q.id);
  const allOptions = await db
    .select()
    .from(quizOptions)
    .where(
      eq(
        quizOptions.questionId,
        questionIds.length > 0 ? questionIds[0] : 0
      )
    );

  // If there are multiple questions, get options for all of them
  if (questionIds.length > 1) {
    for (let i = 1; i < questionIds.length; i++) {
      const moreOptions = await db
        .select()
        .from(quizOptions)
        .where(eq(quizOptions.questionId, questionIds[i]));
      allOptions.push(...moreOptions);
    }
  }

  // Group options by question ID
  const optionsByQuestion = new Map<number, typeof allOptions>();
  for (const option of allOptions) {
    if (!optionsByQuestion.has(option.questionId)) {
      optionsByQuestion.set(option.questionId, []);
    }
    optionsByQuestion.get(option.questionId)!.push(option);
  }

  // Transform database format to QuizSet format
  const quizSet: QuizSet = {
    version: latestQuizSet[0].version,
    source: latestQuizSet[0].source || undefined,
    language: 'hu',
    questions: questions.map((q) => {
      const questionOptions = optionsByQuestion.get(q.id) || [];
      // Sort by sortOrder
      questionOptions.sort((a, b) => a.sortOrder - b.sortOrder);

      return {
        id: q.externalId,
        topic: q.topic,
        type: q.type,
        prompt: q.prompt,
        options:
          questionOptions.length > 0
            ? questionOptions.map((opt) => ({
                id: opt.logicalId,
                text: opt.text
              }))
            : undefined,
        pairs: q.pairs || undefined,
        answer: q.answer,
        explanation: q.explanation || undefined,
        difficulty: q.difficulty || undefined
      };
    })
  };

  return {
    quizSet
  };
};
