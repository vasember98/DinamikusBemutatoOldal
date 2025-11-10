<script lang="ts">
  import type { SingleChoiceQuestion } from '../model';

  const { question, value, onanswer } = $props<{
    question: SingleChoiceQuestion;
    value: number | string | undefined;
    onanswer: (val: number | string) => void;
  }>();

  function choose(id: number | string) {
    onanswer(id);
  }
</script>

<div class="sc">
  {#each question.options as opt}
    <label class:selected={value === opt.id}>
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
    gap: 0.4rem;
  }
  label.selected {
    font-weight: 600;
  }
</style>
