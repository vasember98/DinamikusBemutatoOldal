<script lang="ts">
  import type { MultipleChoiceQuestion } from '../model';
  type Status = 'unanswered' | 'correct' | 'wrong';

  const { question, value, status, revealCorrection, onanswer } = $props<{
    question: MultipleChoiceQuestion;
    value: (number | string)[] | undefined;
    status: Status;
    revealCorrection: boolean;
    onanswer: (val: (number | string)[]) => void;
  }>();

  let selected = $state<Set<number | string>>(new Set(value ?? []));

  $effect(() => {
    selected = new Set(value ?? []);
  });

  function toggle(id: number | string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selected = next;
    onanswer(Array.from(next));
  }

  function itemClass(id: number | string) {
    const isSelected = selected.has(id);
    const isCorrect = question.correctIds.includes(id);

    if (!revealCorrection || status === 'unanswered') {
      return isSelected ? 'selected' : '';
    }

    if (isCorrect && isSelected) return 'correct';
    if (isCorrect && !isSelected) return 'missed';
    if (!isCorrect && isSelected) return 'wrong';
    return '';
  }
</script>

<div class="mc">
  {#each question.options as opt}
    <label class={itemClass(opt.id)}>
      <input
        type="checkbox"
        value={opt.id}
        checked={selected.has(opt.id)}
        onchange={() => toggle(opt.id)}
      />
      <span>{opt.text}</span>
    </label>
  {/each}
</div>

<style>
  .mc {
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
  label.missed {
    background: #fef9c3;
    border: 1px solid #eab308;
  }
  label.wrong {
    background: #fee2e2;
    border: 1px solid #ef4444;
  }
  input {
    accent-color: #3b82f6;
  }
</style>
