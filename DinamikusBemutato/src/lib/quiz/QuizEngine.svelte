<script lang="ts">
  import { onMount } from 'svelte';
  import { Quiz } from './model';
  import { BaseQuestion } from './model';
  import QuestionRenderer from './QuestionRenderer.svelte';

  const { quiz } = $props<{ quiz: Quiz }>();

  type Status = 'unanswered' | 'correct' | 'wrong';

  let currentIndex = $state(0);
  let userAnswers = $state<Map<string | number, unknown>>(new Map());
  let answerStatus = $state<Map<string | number, Status>>(new Map());

  let showResults = $state(false);
  let examMode = $state(false); // false = tanuló mód, true = vizsga mód

  // időmérő
  let elapsedMs = $state(0);

  onMount(() => {
    // státusz inicializálás
    const init = new Map<string | number, Status>();
    for (const q of quiz.questions) {
      init.set(q.id, 'unanswered');
    }
    answerStatus = init;

    const start = Date.now();
    const timer = setInterval(() => {
      elapsedMs = Date.now() - start;
    }, 1000);

    return () => clearInterval(timer);
  });

  const elapsedSeconds = $derived(Math.floor(elapsedMs / 1000));
  const elapsedFormatted = $derived(formatTime(elapsedSeconds));

  const correctCount = $derived(
    Array.from(answerStatus.values()).filter((s) => s === 'correct').length
  );

  const answeredCount = $derived(
    Array.from(answerStatus.values()).filter((s) => s !== 'unanswered').length
  );

  const progress = $derived(
    quiz.length > 0 ? ((currentIndex + 1) / quiz.length) * 100 : 0
  );

  function onAnswer(questionId: string | number, value: unknown) {
    const nextAnswers = new Map(userAnswers);
    nextAnswers.set(questionId, value);
    userAnswers = nextAnswers;

    const q = quiz.questions.find((qq: BaseQuestion) => qq.id === questionId);
    if (!q) return;

    const nextStatus = new Map(answerStatus);
    if (q.validate(value)) {
      nextStatus.set(questionId, 'correct');
    } else {
      nextStatus.set(questionId, 'wrong');
    }
    answerStatus = nextStatus;
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
    return { score: correctCount, total: quiz.length };
  }

  function formatTime(totalSec: number): string {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
</script>

<div class="quiz-layout">
  <div class="quiz-main">
    <!-- progress bar -->
    <div class="progress-bar">
      <div class="progress-fill" style={`width: ${progress}%;`}></div>
    </div>

    {#if !showResults}
      {#if quiz.getQuestion(currentIndex)}
        {@const q = quiz.getQuestion(currentIndex)}
        {@const s = answerStatus.get(q.id) ?? 'unanswered'}

        <!--
          revealCorrection:
          - tanuló mód: azonnal, ha már válaszolt (s != 'unanswered')
          - vizsga mód: csak akkor, ha befejeztük és már válaszolt (score-olható)
        -->
        {@const revealCorrection =
          (!examMode && s !== 'unanswered') ||
          (examMode && showResults && s !== 'unanswered')}

        <QuestionRenderer
          question={q}
          value={userAnswers.get(q.id)}
          status={s}
          revealCorrection={revealCorrection}
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
      <div class="results-card">
        <h2>Eredmény</h2>
        <p><strong>{result.score}</strong> / {result.total} helyes válasz</p>
        <p>Idő: {elapsedFormatted}</p>
        {#if examMode}
          <p>Vizsga mód: a jelölések most láthatók.</p>
        {:else}
          <p>Tanuló mód: minden kérdésnél azonnali visszajelzés volt.</p>
        {/if}
      </div>
    {/if}
  </div>

  <!-- jobb oldali HUD -->
  <aside class="quiz-sidebar">
    <div class="sidebar-card">
      <div class="label">Kérdés</div>
      <div class="value">{currentIndex + 1} / {quiz.length}</div>
    </div>

    <div class="sidebar-card">
      <div class="label">Helyes válaszok</div>
      <div class="value good">{correctCount}</div>
    </div>

    <div class="sidebar-card">
      <div class="label">Megválaszolt</div>
      <div class="value">{answeredCount}</div>
    </div>

    <div class="sidebar-card">
      <div class="label">Eltelt idő</div>
      <div class="value">{elapsedFormatted}</div>
    </div>

    <div class="sidebar-card">
      <div class="label">Vizsga mód</div>
      <label class="toggle">
        <input
          type="checkbox"
          checked={examMode}
          onchange={(e) => (examMode = e.currentTarget.checked)}
        />
        <span>{examMode ? 'Be' : 'Ki'}</span>
      </label>
      <p class="hint">
        Tanuló mód: azonnali jó/rossz jelzés.<br />
        Vizsga mód: csak befejezés után látszanak.
      </p>
    </div>
  </aside>
</div>

<style>
  .quiz-layout {
    max-width: 1100px;
    margin: 2rem auto;
    padding: 1.5rem;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(230px, 1fr);
    gap: 1.5rem;
  }

  .quiz-main {
    display: grid;
    gap: 1rem;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: #f1f5f9;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 999px;
    background: #3b82f6;
    transition: width 0.25s ease;
  }

  .nav {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .nav button {
    padding: 0.5rem 1rem;
    border-radius: 0.6rem;
    border: 1px solid #d4d4d8;
    background: #f9fafb;
    cursor: pointer;
    font-size: 0.95rem;
  }

  .nav button:hover:not(:disabled) {
    background: #e5e7eb;
  }

  .nav button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .quiz-sidebar {
    display: grid;
    gap: 0.75rem;
    align-content: flex-start;
  }

  .sidebar-card {
    padding: 0.7rem 0.9rem;
    border-radius: 0.75rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    display: grid;
    gap: 0.2rem;
  }

  .label {
    font-size: 0.78rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .value {
    font-size: 1.2rem;
    font-weight: 600;
  }

  .value.good {
    color: #22c55e;
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.9rem;
  }

  .toggle input {
    accent-color: #3b82f6;
  }

  .hint {
    font-size: 0.72rem;
    color: #6b7280;
    margin: 0;
  }

  .results-card {
    padding: 1.25rem;
    border-radius: 0.85rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    display: grid;
    gap: 0.4rem;
  }
</style>
