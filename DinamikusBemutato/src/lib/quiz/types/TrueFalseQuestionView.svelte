<script lang="ts">
  import type { TrueFalseQuestion } from '../model';

  const { question, value, onanswer } = $props<{
    question: TrueFalseQuestion;
    value: boolean | undefined;
    onanswer: (val: boolean) => void;
  }>();

  function choose(val: boolean) {
    onanswer(val);
  }
</script>

<div class="tf">
  <button
    type="button"
    class:selected={value === true}
    onclick={() => choose(true)}
  >
    Igaz
  </button>
  <button
    type="button"
    class:selected={value === false}
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
  button.selected {
    font-weight: bold;
    outline: 2px solid #333;
  }
</style>
