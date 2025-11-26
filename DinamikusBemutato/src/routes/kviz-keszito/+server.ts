import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
  quizSets,
  quizQuestions,
  quizOptions,
  type MatchPairs,
  type AnswerValue
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { QuizQuestion } from '$lib/quiz/types.ts';
type Mode = 'create' | 'update';
type IncomingPayload = {
  mode?: Mode;
  quizSetId?: number;
  quizSetMeta: {
    version: string;
    source?: string;
    language: 'hu';
  };
  questionId?: number;
  question: QuizQuestion;
};
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json()) as IncomingPayload;
    const mode: Mode = body.mode ?? 'create';
    const { quizSetMeta, question } = body;
    let { quizSetId, questionId } = body;
    if (!question.id || !question.topic || !question.type || !question.prompt) {
      return json(
        { error: 'Hiányzó kötelező mező a question-ben.' },
        { status: 400 }
      );
    }
    const pairsJson: MatchPairs | null =
      question.type === 'match_pairs' && question.pairs
        ? {
            left: question.pairs.left,
            right: question.pairs.right
          }
        : null;
    const answerJson: AnswerValue = question.answer as AnswerValue;
    if (mode === 'create') {
      if (!quizSetId) {
        const ids = await db
          .insert(quizSets)
          .values({
            version: quizSetMeta.version,
            source: quizSetMeta.source,
            language: quizSetMeta.language
          })
          .$returningId();
        const newId =
          typeof ids[0] === 'object' ? (ids[0] as any).id : ids[0];
        if (!newId) {
          return json(
            { error: 'Nem sikerült quiz_set sort létrehozni.' },
            { status: 500 }
          );
        }
        quizSetId = newId;
      }
    } else if (mode === 'update') {
      if (!quizSetId || !questionId) {
        return json(
          { error: 'Update-hez szükség van quizSetId + questionId értékekre.' },
          { status: 400 }
        );
      }
    }
    if (!quizSetId) {
      return json(
        { error: 'Nem ismert quizSetId (create után sem).' },
        { status: 500 }
      );
    }
    let finalQuestionId: number;
    if (mode === 'create') {
      const ids = await db
        .insert(quizQuestions)
        .values({
          quizSetId,
          externalId: String(question.id),
          topic: question.topic,
          type: question.type,
          prompt: question.prompt,
          explanation: question.explanation ?? null,
          difficulty: question.difficulty ?? null,
          answer: answerJson,
          pairs: pairsJson
        })
        .$returningId();
      const newQid =
        typeof ids[0] === 'object' ? (ids[0] as any).id : ids[0];
      if (!newQid) {
        return json(
          { error: 'Nem sikerült a kérdést beszúrni.' },
          { status: 500 }
        );
      }
      finalQuestionId = newQid;
    } else {
      await db
        .update(quizQuestions)
        .set({
          quizSetId,
          externalId: String(question.id),
          topic: question.topic,
          type: question.type,
          prompt: question.prompt,
          explanation: question.explanation ?? null,
          difficulty: question.difficulty ?? null,
          answer: answerJson,
          pairs: pairsJson
        })
        .where(eq(quizQuestions.id, questionId!));
      finalQuestionId = questionId!;
      await db
        .delete(quizOptions)
        .where(eq(quizOptions.questionId, finalQuestionId));
    }
    if (question.options && question.options.length > 0) {
      const rows = question.options.map((opt, index) => ({
        questionId: finalQuestionId,
        logicalId: String(opt.id),
        text: opt.text,
        sortOrder: index
      }));
      await db.insert(quizOptions).values(rows);
    }
    return json({
      ok: true,
      mode,
      quizSetId,
      quizQuestionId: finalQuestionId
    });
  } catch (err) {
    console.error('POST /kviz-keszito hiba:', err);
    return json({ message: 'Internal Error' }, { status: 500 });
  }
};
