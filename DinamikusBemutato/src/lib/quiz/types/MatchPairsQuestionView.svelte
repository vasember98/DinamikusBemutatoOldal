<script lang="ts">
  import type { MatchPairsQuestion } from '../model';

  const { question, value, onanswer } = $props<{
    question: MatchPairsQuestion;
    value: number[] | undefined;
    onanswer: (val: number[]) => void;
  }>();

  let mapping = $state<number[]>(
    value && value.length === question.pairs.left.length
      ? [...value]
      : Array(question.pairs.left.length).fill(-1)
  );

  $effect(() => {
    if (value && value.length === question.pairs.left.length) {
      mapping = [...value];
    }
  });

  function setMatch(leftIndex: number, rightIndex: number) {
    const next = [...mapping];
    next[leftIndex] = rightIndex;
    mapping = next;
    onanswer(next);
  }
</script>

<div class="match">
  <div class="left">
    {#each question.pairs.left as left, i}
      <div class="row">
        <span>{left}</span>
        <select
          value={mapping[i]}
          onchange={(e) => setMatch(i, Number(e.currentTarget.value))}
        >
          <option value={-1}>Válassz...</option>
          {#each question.pairs.right as right, j}
            <option value={j}>{j + 1}. {right}</option>
          {/each}
        </select>
      </div>
    {/each}
  </div>
  <div class="right-list">
    {#each question.pairs.right as right, j}
      <div>{j + 1}. {right}</div>
    {/each}
  </div>
</div>

<style>
  .match {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 0.75rem;
  }
  .row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.25rem;
  }
</style>
