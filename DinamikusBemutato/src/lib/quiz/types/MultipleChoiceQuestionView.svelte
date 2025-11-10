<script lang="ts">
  import type { MultipleChoiceQuestion } from '../model';

  const { question, value, onanswer } = $props<{
    question: MultipleChoiceQuestion;
    value: (number | string)[] | undefined;
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
</script>

<div class="mc">
  {#each question.options as opt}
    <label class:selected={selected.has(opt.id)}>
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
    gap: 0.4rem;
  }
  label.selected {
    font-weight: 600;
  }
</style>
