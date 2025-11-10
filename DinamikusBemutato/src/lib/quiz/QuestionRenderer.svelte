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

  const { question, value, onanswer } = $props<{
    question: BaseQuestion;
    value: unknown;
    onanswer: (id: string | number, value: unknown) => void;
  }>();

  function handleAnswer(val: unknown) {
    onanswer(question.id, val);
  }
</script>

<div class="question-wrapper">
  <h3>{question.prompt}</h3>

  {#if question instanceof TrueFalseQuestion}
    <TrueFalseQuestionView
      question={question as TrueFalseQuestion}
      value={value as boolean | undefined}
      onanswer={(val) => handleAnswer(val)}
    />
  {:else if question instanceof SingleChoiceQuestion}
    <SingleChoiceQuestionView
      question={question as SingleChoiceQuestion}
      value={value as number | string | undefined}
      onanswer={(val) => handleAnswer(val)}
    />
  {:else if question instanceof MultipleChoiceQuestion}
    <MultipleChoiceQuestionView
      question={question as MultipleChoiceQuestion}
      value={value as (number | string)[] | undefined}
      onanswer={(val) => handleAnswer(val)}
    />
  {:else if question instanceof MatchPairsQuestion}
    <MatchPairsQuestionView
      question={question as MatchPairsQuestion}
      value={value as number[] | undefined}
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
    display: grid;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid #ddd;
  }
  .explanation {
    font-size: 0.9rem;
  }
</style>
