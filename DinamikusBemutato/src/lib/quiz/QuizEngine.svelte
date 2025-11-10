<script lang="ts">
  import QuestionRenderer from './QuestionRenderer.svelte';
  import { Quiz } from './model';

  const { quiz } = $props<{ quiz: Quiz }>();

  let currentIndex = $state(0);
  let userAnswers = $state<Map<string | number, unknown>>(new Map());
  let showResults = $state(false);

  function onAnswer(questionId: string | number, value: unknown) {
    const next = new Map(userAnswers);
    next.set(questionId, value);
    userAnswers = next;
  }

  function nextQuestion() {
    if (currentIndex < quiz.length - 1) {
      currentIndex = currentIndex + 1;
    } else {
      showResults = true;
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      currentIndex = currentIndex - 1;
    }
  }

  function calcScore() {
    let score = 0;
    for (const q of quiz.questions) {
      const ans = userAnswers.get(q.id);
      if (q.validate(ans)) score++;
    }
    return { score, total: quiz.length };
  }
</script>

<div class="quiz-engine">
  {#if !showResults}
    {#if quiz.getQuestion(currentIndex)}
      <QuestionRenderer
        question={quiz.getQuestion(currentIndex)}
        value={userAnswers.get(quiz.getQuestion(currentIndex).id)}
        onanswer={onAnswer}
      />
    {/if}

    <div class="nav">
      <button type="button" onclick={prevQuestion} disabled={currentIndex === 0}>
        Előző
      </button>
      <button type="button" onclick={nextQuestion}>
        {currentIndex === quiz.length - 1 ? 'Befejezés' : 'Következő'}
      </button>
    </div>
  {:else}
    {@const result = calcScore()}
    <div class="results">
      <h2>Eredmény</h2>
      <p>{result.score} / {result.total} helyes</p>
    </div>
  {/if}
</div>

<style>
  .quiz-engine {
    display: grid;
    gap: 1rem;
  }
  .nav {
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
  }
</style>
