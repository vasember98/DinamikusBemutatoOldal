<script lang="ts">
  import type { MatchPairsQuestion } from '../model';
  type Status = 'unanswered' | 'correct' | 'wrong';
  const { question, value, status, revealCorrection, onanswer } = $props<{
    question: MatchPairsQuestion;
    value: number[] | undefined;
    status: Status;
    revealCorrection: boolean;
    onanswer: (val: number[]) => void;
  }>();
  let mapping = $state<number[]>(
    value && value.length === question.pairs.left.length
      ? [...value]
      : Array(question.pairs.left.length).fill(-1)
  );
  let draggingRightIndex = $state<number | null>(null);
  let draggingSourceRow = $state<number | null>(null);
  $effect(() => {
    if (value && value.length === question.pairs.left.length) {
      mapping = [...value];
    }
  });
  function startDragFromPool(rightIndex: number) {
    draggingRightIndex = rightIndex;
    draggingSourceRow = null;
  }
  function startDragFromRow(leftIndex: number) {
    const r = mapping[leftIndex];
    if (r === -1) return;
    draggingRightIndex = r;
    draggingSourceRow = leftIndex;
  }
  function endDrag() {
    draggingRightIndex = null;
    draggingSourceRow = null;
  }
  function applyDrop(leftIndex: number, rightIndex: number | null, fromRow: number | null) {
    if (rightIndex === null) return;
    const next = [...mapping];
    if (fromRow !== null && fromRow >= 0 && fromRow < next.length && fromRow !== leftIndex) {
      next[fromRow] = -1;
    }
    for (let i = 0; i < next.length; i++) {
      if (i !== fromRow && next[i] === rightIndex && i !== leftIndex) {
        next[i] = -1;
      }
    }
    next[leftIndex] = rightIndex;
    mapping = next;
    onanswer(next);
  }
  function dropOn(leftIndex: number, event: DragEvent) {
    event.preventDefault();
    applyDrop(leftIndex, draggingRightIndex, draggingSourceRow);
    draggingRightIndex = null;
    draggingSourceRow = null;
  }
  function dropOnKeyboard(leftIndex: number) {
    if (draggingRightIndex === null) return;
    applyDrop(leftIndex, draggingRightIndex, draggingSourceRow);
    draggingRightIndex = null;
    draggingSourceRow = null;
  }
  function onDragOverRow(event: DragEvent) {
    event.preventDefault();
  }
  function clearRow(leftIndex: number) {
    const next = [...mapping];
    next[leftIndex] = -1;
    mapping = next;
    onanswer(next);
  }
  function isRightUsed(rightIndex: number): boolean {
    return mapping.includes(rightIndex);
  }
  function rowClass(i: number): string {
    if (!revealCorrection || status === 'unanswered') return '';
    const chosen = mapping[i];
    const correct = question.solution[i];
    if (chosen === -1) return 'unfilled';
    if (chosen === correct) return 'correct';
    return 'wrong';
  }
  function rightClass(j: number): string {
    if (!revealCorrection || status === 'unanswered') {
      return isRightUsed(j) ? 'used' : '';
    }
    const appearsAsSolution = question.solution.includes(j);
    const used = isRightUsed(j);
    if (appearsAsSolution && used) return 'correct';
    if (appearsAsSolution && !used) return 'missed';
    if (!appearsAsSolution && used) return 'wrong';
    return '';
  }
  function displayRightLabel(i: number): string {
    const r = mapping[i];
    if (r === -1) return 'Húzd ide a megfelelő definíciót';
    return question.pairs.right[r];
  }
</script>
<div class="match">
  <div class="left">
    {#each question.pairs.left as left, i}
      <div
        class={`row ${rowClass(i)}`}
        ondragover={onDragOverRow}
        ondrop={(event) => dropOn(i, event)}
        role="button"
        tabindex="0"
        aria-label={`Célterület: ${left}`}
        onkeydown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && draggingRightIndex !== null) {
            e.preventDefault();
            dropOnKeyboard(i);
          }
          if ((e.key === 'Enter' || e.key === ' ') && draggingRightIndex === null && mapping[i] !== -1) {
            e.preventDefault();
            startDragFromRow(i);
          }
        }}
      >
        <div class="left-label">
          {i + 1}. {left}
        </div>
        <div
            class="drop-target"
            draggable={mapping[i] !== -1}
            ondragstart={() => startDragFromRow(i)}
            ondragend={endDrag}
            role="button"
            tabindex={mapping[i] !== -1 ? 0 : -1}
            >
  <span class:placeholder={mapping[i] === -1}>
            {displayRightLabel(i)}
          </span>
          {#if mapping[i] !== -1}
            <button
              type="button"
              class="clear-btn"
              onclick={() => clearRow(i)}
            >
              ✕
            </button>
          {/if}
        </div>
      </div>
    {/each}
  </div>
  <div class="right">
    <div class="right-title">Definíciók</div>
    {#each question.pairs.right as right, j}
      <div
        class={`right-item ${rightClass(j)}`}
        draggable="true"
        ondragstart={() => startDragFromPool(j)}
        ondragend={endDrag}
        role="button"
        tabindex="0"
        aria-grabbed={isRightUsed(j) ? 'true' : 'false'}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            startDragFromPool(j);
          }
        }}
      >
        {j + 1}. {right}
        {#if isRightUsed(j)}
          <span class="tag">használatban</span>
        {/if}
      </div>
    {/each}
    <div class="hint">
      Húzd a jobb oldali definíciókat a bal oldali sorokra.
      Ha már egy sorban van, azt is áthúzhatod másik sorba.
    </div>
  </div>
</div>
<style>
  .match {
    display: grid;
    grid-template-columns: minmax(0, 2.2fr) minmax(200px, 1.4fr);
    gap: 1rem;
    align-items: flex-start;
  }
  .left {
    display: grid;
    gap: 0.4rem;
  }
  .row {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 2fr);
    gap: 0.5rem;
    align-items: center;
    padding: 0.4rem 0.5rem;
    border-radius: 0.6rem;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    transition: background 0.15s ease, border-color 0.15s ease;
    min-height: 2.4rem;
  }
  .row.correct {
    border-color: #22c55e;
    background: #dcfce7;
  }
  .row.wrong {
    border-color: #ef4444;
    background: #fee2e2;
  }
  .row.unfilled {
    border-style: dashed;
  }
  .left-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #111827;
  }
  .drop-target {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.45rem;
    border-radius: 0.5rem;
    background: #ffffff;
    min-height: 1.8rem;
    box-shadow: inset 0 0 0 1px #e5e7eb;
    width: 100%;
    box-sizing: border-box;
    cursor: grab;
  }
  .drop-target[draggable="false"] {
    cursor: default;
  }
  .drop-target span {
    font-size: 0.85rem;
    color: #111827;
    flex: 1;
    word-break: break-word;
  }
  .drop-target span.placeholder {
    color: #9ca3af;
    font-style: italic;
  }
  .clear-btn {
    border: none;
    background: transparent;
    color: #9ca3af;
    cursor: pointer;
    font-size: 0.8rem;
    padding: 0;
  }
  .clear-btn:hover {
    color: #ef4444;
  }
  .right {
    display: grid;
    gap: 0.35rem;
  }
  .right-title {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #6b7280;
    letter-spacing: 0.06em;
    margin-bottom: 0.1rem;
  }
  .right-item {
    padding: 0.35rem 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    font-size: 0.85rem;
    cursor: grab;
    display: flex;
    justify-content: space-between;
    gap: 0.4rem;
    align-items: center;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s;
  }
  .right-item:active {
    cursor: grabbing;
    transform: scale(0.98);
  }
  .right-item.used {
    opacity: 0.7;
  }
  .right-item.correct {
    border-color: #22c55e;
    background: #dcfce7;
  }
  .right-item.wrong {
    border-color: #ef4444;
    background: #fee2e2;
  }
  .right-item.missed {
    border-color: #eab308;
    background: #fef9c3;
  }
  .tag {
    font-size: 0.65rem;
    padding: 0.1rem 0.3rem;
    border-radius: 999px;
    background: #e5e7eb;
    color: #4b5563;
    white-space: nowrap;
  }
  .hint {
    margin-top: 0.25rem;
    font-size: 0.7rem;
    color: #9ca3af;
  }
</style>
