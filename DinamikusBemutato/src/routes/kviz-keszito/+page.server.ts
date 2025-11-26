import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { quizSets, quizQuestions, quizOptions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
type LoadedQuestion = {
  id: number;
  quizSetId: number;
  externalId: string;
  topic: string;
  type: string;
  prompt: string;
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  answer: unknown;
  pairs: unknown | null;
};
type LoadedOption = {
  id: number;
  logicalId: string;
  text: string;
  sortOrder: number;
};
type EditQuestionPayload = {
  question: LoadedQuestion;
  options: LoadedOption[];
} | null;
export const load: PageServerLoad = async (event) => {
  const { url } = event;
  const quizSetRows = await db
    .select({
      id: quizSets.id,
      version: quizSets.version,
      source: quizSets.source,
      language: quizSets.language
    })
    .from(quizSets);
  const questionIdParam = url.searchParams.get('questionId');
  let editQuestion: EditQuestionPayload = null;
  if (questionIdParam) {
    const qid = Number(questionIdParam);
    if (!Number.isNaN(qid)) {
      const [q] = await db
        .select({
          id: quizQuestions.id,
          quizSetId: quizQuestions.quizSetId,
          externalId: quizQuestions.externalId,
          topic: quizQuestions.topic,
          type: quizQuestions.type,
          prompt: quizQuestions.prompt,
          explanation: quizQuestions.explanation,
          difficulty: quizQuestions.difficulty,
          answer: quizQuestions.answer,
          pairs: quizQuestions.pairs
        })
        .from(quizQuestions)
        .where(eq(quizQuestions.id, qid))
        .limit(1);
      if (q) {
        const opts = await db
          .select({
            id: quizOptions.id,
            logicalId: quizOptions.logicalId,
            text: quizOptions.text,
            sortOrder: quizOptions.sortOrder
          })
          .from(quizOptions)
          .where(eq(quizOptions.questionId, qid));
        editQuestion = { question: q, options: opts };
      }
    }
  }
  return {
    quizSets: quizSetRows,
    editQuestion
  };
};
