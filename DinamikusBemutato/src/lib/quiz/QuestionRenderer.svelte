<script lang="ts">
  import type { BaseQuestion } from './model';
  import {
    TrueFalseQuestion,
    SingleChoiceQuestion,
    MultipleChoiceQuestion,
    MatchPairsQuestion
  } from './model';

  import TrueFalseQuestionView from './types/TrueFalseQuestionView.svelte';
  import SingleChoiceQuestionView from './types/SingleChoiceQuestionView.svelte';
  import MultipleChoiceQuestionView from './types/MultipleChoiceQuestionView.svelte';
  import MatchPairsQuestionView from './types/MatchPairsQuestionView.svelte';

  type Status = 'unanswered' | 'correct' | 'wrong';

  const { question, value, status, revealCorrection, onanswer } = $props<{
    question: BaseQuestion;
    value: unknown;
    status: Status;
    revealCorrection: boolean;
    onanswer: (id: string | number, value: unknown) => void;
  }>();

  function handleAnswer(val: unknown) {
    onanswer(question.id, val);
  }

  const showState = revealCorrection && status !== 'unanswered';

  const statusClass =
    showState && status === 'correct'
      ? 'is-correct'
      : showState && status === 'wrong'
      ? 'is-wrong'
      : 'is-neutral';
</script>

<div class={`question-wrapper ${statusClass}`}>
  <div class="prompt">
    <h3>{question.prompt}</h3>
  </div>

  {#if question instanceof TrueFalseQuestion}
    <TrueFalseQuestionView
      question={question as TrueFalseQuestion}
      value={value as boolean | undefined}
      revealCorrection={showState}
      status={status}
      onanswer={(val) => handleAnswer(val)}
    />
  {:else if question instanceof SingleChoiceQuestion}
    <SingleChoiceQuestionView
      question={question as SingleChoiceQuestion}
      value={value as number | string | undefined}
      revealCorrection={showState}
      status={status}
      onanswer={(val) => handleAnswer(val)}
    />
  {:else if question instanceof MultipleChoiceQuestion}
    <MultipleChoiceQuestionView
      question={question as MultipleChoiceQuestion}
      value={value as (number | string)[] | undefined}
      revealCorrection={showState}
      status={status}
      onanswer={(val) => handleAnswer(val)}
    />
  {:else if question instanceof MatchPairsQuestion}
    <MatchPairsQuestionView
      question={question as MatchPairsQuestion}
      value={value as number[] | undefined}
      revealCorrection={showState}
      status={status}
      onanswer={(val) => handleAnswer(val)}
    />
  {:else}
    <p>Ismeretlen kérdéstípus.</p>
  {/if}

  {#if question.explanation}
    <details class="explanation">
      <summary>Magyarázat</summary>
      <p>{question.explanation}</p>
    </details>
  {/if}
</div>

<style>
  .question-wrapper {
    padding: 1.1rem 1.2rem;
    border-radius: 0.9rem;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    display: grid;
    gap: 0.75rem;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.04);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .question-wrapper.is-correct {
    border-color: #22c55e;
    box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.16);
    background: #f0fdf4;
  }

  .question-wrapper.is-wrong {
    border-color: #ef4444;
    box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.16);
    background: #fef2f2;
  }

  .prompt h3 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
  }

  .explanation {
    font-size: 0.88rem;
    color: #555;
  }
</style>
