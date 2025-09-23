<script lang="ts">
  // Svelte 5 runes mode: $props, $state, DOM event props (no on:, no dispatch)
  // This version addresses a11y: adds ARIA role, aria-grabbed, and enumerated draggable.
  let {
    id = 'data-1',
    label = 'x',
    value = 12 as any,             // scalar or array
    draggable = true,
    onchange                        // callback prop
  } = $props();

  let dragging = $state(false);
  let editing = $state(false);
  let inputText = $state(toInputText(value));

  function toInputText(v: any): string {
    if (Array.isArray(v)) return `[${v.join(',')}]`;
    if (typeof v === 'string') return JSON.stringify(v);
    return String(v);
  }

  function parseValue(text: string): any {
    const t = text.trim();
    if (t.startsWith('[') || t.startsWith('"') || t.startsWith("'")) {
      try { return JSON.parse(t); } catch {}
    }
    const n = Number(t);
    if (!Number.isNaN(n)) return n;
    return t;
  }

  function commitEdit() {
    value = parseValue(inputText);
    onchange?.({ value });
    editing = false;
  }

  function setDragPayload(e: DragEvent) {
    if (!e.dataTransfer) return;
    const payload = { kind: 'node', nodeType: 'data', id, label, value };
    e.dataTransfer.setData('application/x-svelte-dnd', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copyMove';
  }

  function ondragstart(e: DragEvent) {
    if (!draggable) { e.preventDefault(); return; }
    setDragPayload(e);
    dragging = true;
  }
  function ondragend() { dragging = false; }
</script>

<style>
  .card { user-select: none; border: 1px solid rgba(0,0,0,0.15); border-radius: 12px; padding: 10px 12px; background: white; display: grid; gap: 8px; min-width: 180px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); transition: transform 120ms ease, box-shadow 120ms ease; }
  .dragging { transform: scale(0.98); box-shadow: 0 6px 18px rgba(0,0,0,0.15); }
  .row { display: flex; align-items: center; gap: 8px; justify-content: space-between; }
  .key { font-weight: 600; }
  .val { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .edit { width: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; border: 1px solid rgba(0,0,0,0.15); border-radius: 8px; padding: 6px 8px; }
  .actions { display: flex; gap: 8px; justify-content: flex-end; }
  button { border: 1px solid rgba(0,0,0,0.15); border-radius: 8px; padding: 4px 8px; background: #f7f7f7; cursor: pointer; }
  button:hover { background: #eee; }
</style>

<div
  class="card {dragging ? 'dragging' : ''}"
  role="listitem"
  aria-label={`Data node ${label}`}
  aria-grabbed={dragging}
  tabindex="-1"
  draggable={draggable ? 'true' : 'false'}
  ondragstart={ondragstart}
  ondragend={ondragend}
>
  <div class="row" title="Drag this data node">
    <span class="key">{label}</span>
    <small class="val">#{id}</small>
  </div>

  {#if editing}
    <textarea class="edit" bind:value={inputText} rows={3}></textarea>
    <div class="actions">
      <button onclick={commitEdit}>Save</button>
      <button onclick={() => { inputText = toInputText(value); editing = false; }}>Cancel</button>
    </div>
  {:else}
    <div class="val">{toInputText(value)}</div>
    <div class="actions">   
      <button onclick={() => { editing = true; }}>Edit</button>
    </div>
  {/if}
</div>

<!-- Notes:
  * role="listitem" can be changed to role="button" or role="group" depending on context.
  * aria-grabbed reflects drag state; you can also expose aria-describedby for hints.
  * HTML enumerated attribute: draggable expects "true" | "false" strings.
-->
