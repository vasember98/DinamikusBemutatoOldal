<script lang="ts">
  import type { SingleChoiceQuestion } from '../model';
  type Status = 'unanswered' | 'correct' | 'wrong';
  const { question, value, status, revealCorrection, onanswer } = $props<{
    question: SingleChoiceQuestion;
    value: number | string | undefined;
    status: Status;
    revealCorrection: boolean;
    onanswer: (val: number | string) => void;
  }>();
  function choose(id: number | string) {
    onanswer(id);
  }
  function itemClass(id: number | string) {
    if (!revealCorrection || status === 'unanswered') {
      return value === id ? 'selected' : '';
    }
    if (id === question.correctId) return 'correct';
    if (value === id && id !== question.correctId) return 'wrong';
    return '';
  }
</script>
<div class="sc">
  {#each question.options as opt}
    <label class={itemClass(opt.id)}>
      <input
        type="radio"
        name={"q-" + question.id}
        value={opt.id}
        checked={value === opt.id}
        onchange={() => choose(opt.id)}
      />
      <span>{opt.text}</span>
    </label>
  {/each}
</div>
<style>
  .sc {
    display: grid;
    gap: 0.35rem;
  }
  label {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    padding: 0.25rem 0.4rem;
    border-radius: 0.5rem;
  }
  label.selected {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
  }
  label.correct {
    background: #dcfce7;
    border: 1px solid #22c55e;
    font-weight: 600;
  }
  label.wrong {
    background: #fee2e2;
    border: 1px solid #ef4444;
  }
  input {
    accent-color: #3b82f6;
  }
</style>
