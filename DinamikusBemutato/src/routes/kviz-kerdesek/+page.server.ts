import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { quizQuestions, quizSets } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
  // csak hogy ne legyen "unused"
  void event;

  const rows = await db
    .select({
      id: quizQuestions.id,
      externalId: quizQuestions.externalId,
      topic: quizQuestions.topic,
      type: quizQuestions.type,
      difficulty: quizQuestions.difficulty,
      quizSetId: quizQuestions.quizSetId,
      createdAt: quizQuestions.createdAt,
      quizSetVersion: quizSets.version,
      quizSetSource: quizSets.source
    })
    .from(quizQuestions)
    .leftJoin(quizSets, eq(quizQuestions.quizSetId, quizSets.id))
    .orderBy(quizQuestions.quizSetId, quizQuestions.id);

  return {
    questions: rows
  };
};
