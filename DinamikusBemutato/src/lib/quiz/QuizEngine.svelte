<script lang="ts">
  import { onMount } from 'svelte';
  import { Quiz } from './model';
  import { BaseQuestion } from './model';
  import QuestionRenderer from './QuestionRenderer.svelte';
  const { quiz: fullQuiz } = $props<{ quiz: Quiz }>();
  type Status = 'unanswered' | 'correct' | 'wrong';
  let quizStarted = $state(false);
  let selectedCount = $state<number | 'all'>('all');
  let quiz = $state(fullQuiz);
  let currentIndex = $state(0);
  let userAnswers = $state<Map<string | number, unknown>>(new Map());
  let answerStatus = $state<Map<string | number, Status>>(new Map());
  let showResults = $state(false);
  let examMode = $state(false);
  let elapsedMs = $state(0);
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  
  function startQuiz() {
    if (selectedCount === 'all') {
      quiz = fullQuiz;
    } else {
      const shuffled = [...fullQuiz.questions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, selectedCount);
      quiz = new Quiz({
        version: fullQuiz.version,
        language: fullQuiz.language,
        source: fullQuiz.source,
        questions: selected.map(q => ({
          id: q.id,
          topic: q.topic,
          type: q.type,
          prompt: q.prompt,
          explanation: q.explanation,
          difficulty: q.difficulty,
          answer: (q as any).correct ?? (q as any).correctId ?? (q as any).correctIds ?? (q as any).solution,
          options: (q as any).options,
          pairs: (q as any).pairs
        }))
      });
    }
    
    const init = new Map<string | number, Status>();
    for (const q of quiz.questions) {
      init.set(q.id, 'unanswered');
    }
    answerStatus = init;
    
    const start = Date.now();
    timerInterval = setInterval(() => {
      elapsedMs = Date.now() - start;
    }, 1000);
    
    quizStarted = true;
  }
  
  onMount(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
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

{#if !quizStarted}
  <div class="start-screen">
    <div class="start-card">
      <h1>Kvíz indítása</h1>
      <p>Válaszd ki, hány kérdésből álljon a kvíz:</p>
      <div class="options">
        <button 
          class="option-btn" 
          class:selected={selectedCount === 10}
          onclick={() => selectedCount = 10}
        >
          10 kérdés
        </button>
        <button 
          class="option-btn" 
          class:selected={selectedCount === 20}
          onclick={() => selectedCount = 20}
        >
          20 kérdés
        </button>
        <button 
          class="option-btn" 
          class:selected={selectedCount === 'all'}
          onclick={() => selectedCount = 'all'}
        >
          Összes ({fullQuiz.length} kérdés)
        </button>
      </div>
      <button class="start-btn" onclick={startQuiz}>
        Kvíz indítása
      </button>
    </div>
  </div>
{:else}
<div class="quiz-layout">
  <div class="quiz-main">
    <div class="progress-bar">
      <div class="progress-fill" style={`width: ${progress}%;`}></div>
    </div>
    {#if !showResults}
      {#if quiz.getQuestion(currentIndex)}
        {@const q = quiz.getQuestion(currentIndex)}
        {@const s = answerStatus.get(q.id) ?? 'unanswered'}
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
      {@const wrongQuestions = quiz.questions.filter((q: BaseQuestion) => answerStatus.get(q.id) === 'wrong')}
      <div class="results-card">
        <h2>Eredmény</h2>
        <p><strong>{result.score}</strong> / {result.total} helyes válasz</p>
        <p>Idő: {elapsedFormatted}</p>
        {#if examMode}
          <p>Vizsga mód: a jelölések most láthatók.</p>
          {#if wrongQuestions.length > 0}
            <div class="wrong-list">
              <h3>Hibás válaszok ({wrongQuestions.length} db):</h3>
              <ul>
                {#each wrongQuestions as wq, idx}
                  <li>
                    <strong>#{idx + 1}:</strong> {wq.prompt.substring(0, 80)}{wq.prompt.length > 80 ? '...' : ''}
                  </li>
                {/each}
              </ul>
            </div>
          {:else}
            <p class="perfect">Minden válasz helyes! 🎉</p>
          {/if}
        {:else}
          <p>Tanuló mód: minden kérdésnél azonnali visszajelzés volt.</p>
        {/if}
      </div>
    {/if}
  </div>
  <aside class="quiz-sidebar">
    <div class="sidebar-card">
      <div class="label">Kérdés</div>
      <div class="value">{currentIndex + 1} / {quiz.length}</div>
    </div>
    {#if !examMode || showResults}
      <div class="sidebar-card">
        <div class="label">Helyes válaszok</div>
        <div class="value good">{correctCount}</div>
      </div>
    {/if}
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
{/if}
<style>
  .start-screen {
    max-width: 600px;
    margin: 4rem auto;
    padding: 1.5rem;
  }
  .start-card {
    padding: 2rem;
    border-radius: 1rem;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    text-align: center;
  }
  .start-card h1 {
    margin: 0 0 1rem 0;
    font-size: 1.75rem;
    color: #1f2937;
  }
  .start-card p {
    margin: 0 0 1.5rem 0;
    color: #6b7280;
  }
  .options {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    justify-content: center;
  }
  .option-btn {
    padding: 0.75rem 1.25rem;
    border-radius: 0.5rem;
    border: 2px solid #e5e7eb;
    background: #f9fafb;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s;
  }
  .option-btn:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
  .option-btn.selected {
    border-color: #3b82f6;
    background: #3b82f6;
    color: white;
  }
  .start-btn {
    padding: 0.875rem 2rem;
    border-radius: 0.5rem;
    border: none;
    background: #10b981;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .start-btn:hover {
    background: #059669;
  }
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
  .wrong-list {
    margin-top: 1rem;
    padding: 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.5rem;
  }
  .wrong-list h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    color: #991b1b;
  }
  .wrong-list ul {
    margin: 0;
    padding-left: 1.25rem;
    list-style: none;
  }
  .wrong-list li {
    margin-bottom: 0.5rem;
    color: #7f1d1d;
    font-size: 0.9rem;
    line-height: 1.4;
  }
  .wrong-list li strong {
    color: #991b1b;
  }
  .perfect {
    color: #22c55e;
    font-weight: 600;
    margin-top: 0.5rem;
  }
</style>
