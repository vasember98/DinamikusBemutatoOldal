<script lang="ts">
  import type { TrueFalseQuestion } from '../model';
  type Status = 'unanswered' | 'correct' | 'wrong';
  const { question, value, status, revealCorrection, onanswer } = $props<{
    question: TrueFalseQuestion;
    value: boolean | undefined;
    status: Status;
    revealCorrection: boolean;
    onanswer: (val: boolean) => void;
  }>();
  function choose(val: boolean) {
    onanswer(val);
  }
  function btnClass(expected: boolean) {
    if (!revealCorrection || status === 'unanswered') {
      return value === expected ? 'selected' : '';
    }
    if (expected === question.correct) {
      return 'correct';
    }
    if (value === expected && value !== question.correct) {
      return 'wrong';
    }
    return '';
  }
</script>
<div class="tf">
  <button
    type="button"
    class={btnClass(true)}
    onclick={() => choose(true)}
  >
    Igaz
  </button>
  <button
    type="button"
    class={btnClass(false)}
    onclick={() => choose(false)}
  >
    Hamis
  </button>
</div>
<style>
  .tf {
    display: flex;
    gap: 0.5rem;
  }
  button {
    padding: 0.4rem 0.8rem;
    border-radius: 0.6rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    cursor: pointer;
  }
  button.selected {
    border-color: #3b82f6;
    background: #eff6ff;
  }
  button.correct {
    border-color: #22c55e;
    background: #dcfce7;
    font-weight: 600;
  }
  button.wrong {
    border-color: #ef4444;
    background: #fee2e2;
  }
</style>
