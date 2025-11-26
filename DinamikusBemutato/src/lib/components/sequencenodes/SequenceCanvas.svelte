<script lang="ts"> 
  import type { CanvasEvent, NodeInstance, InputProps, OutputProps } from '$lib/types/nodes';
  let {
    nodes = [],
    selectedId = null,
    onCanvasEvent
  } = $props<{
    nodes?: NodeInstance[];
    selectedId?: string | null;
    onCanvasEvent?: (ev: CanvasEvent) => void;
  }>();
  const MIME = 'application/x-node';
  let insertIndex = $state<number>(nodes.length);
  $effect(() => { insertIndex = Math.min(insertIndex, nodes.length); });
  function onDragOverCanvas(e: DragEvent) {
    if (e.dataTransfer?.types.includes(MIME)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }
  function onDropCanvas(e: DragEvent) {
    const txt = e.dataTransfer?.getData(MIME);
    if (!txt) return;
    let payload: any;
    try { payload = JSON.parse(txt); } catch { return; }
    if (payload.kind === 'input-node') {
      const props: InputProps = { vars: {} };
      onCanvasEvent?.({ kind: 'create', type: 'input', props, atIndex: insertIndex });
      e.preventDefault();
    } else if (payload.kind === 'output-node') {
      const props: OutputProps = { results: {} };
      onCanvasEvent?.({ kind: 'create', type: 'output', props, atIndex: insertIndex });
      e.preventDefault();
    }
  }
  function setInsert(i: number) { insertIndex = i; }
  function select(id: string) { onCanvasEvent?.({ kind: 'select', id }); }
  function remove(id: string) { onCanvasEvent?.({ kind: 'delete', id }); }
  function indexOfNode(id: string): number {
    return nodes.findIndex((n: NodeInstance) => n.id === id);
  }
</script>
<div
  class="max-w-none"
  role="application"
  aria-label="Sequence canvas"
  ondragover={onDragOverCanvas}
  ondrop={onDropCanvas}
  aria-dropeffect="copy"
>
  <div
    class="h-4 -mb-2 rounded border border-dashed border-transparent data-[active=true]:border-blue-400"
    ondragenter={() => setInsert(0)}
    data-active={insertIndex === 0}
    aria-hidden="true"
  ></div>
  <ol class="grid gap-2" aria-label="Sequence steps">
    {#each nodes as n (n.id)}
      {#if n.type === 'input'}
  <!-- <InputNode
    id={n.id}
    vars={n.props.vars ?? {}}
    selected={selectedId === n.id}
    onSelect={({ id }: { id: string }) => select(id)}
    onDelete={({ id }: { id: string }) => remove(id)}
    onUpdateProps={({ id, vars }: { id: string; vars: any }) =>
      onCanvasEvent?.({ kind: 'updateProps', id, type: 'input', props: { vars } })
    }
  /> -->
  <li class="rounded-xl border p-2">
    <div class="text-sm text-gray-500">Input node (component not implemented)</div>
  </li>
{:else if n.type === 'output'}
  <!-- <OutputNode
    id={n.id}
    results={n.props.results ?? {}}
    selected={selectedId === n.id}
    onSelect={({ id }: { id: string }) => select(id)}
    onDelete={({ id }: { id: string }) => remove(id)}
    onUpdateProps={({ id, results }: { id: string; results: any }) =>
      onCanvasEvent?.({ kind: 'updateProps', id, type: 'output', props: { results } })
    }
  /> -->
  <li class="rounded-xl border p-2">
    <div class="text-sm text-gray-500">Output node (component not implemented)</div>
  </li>
{:else}
  <li class="rounded-xl border p-2">
    <div class="flex items-start gap-3">
      <button
        type="button"
        class="flex-1 rounded-lg px-2 py-2 text-left hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-neutral-900"
        aria-pressed={selectedId === n.id}
        onclick={() => select(n.id)}
      >
        <div class="flex items-start gap-3">
          <div class="mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-xs">{n.type}</div>
          <div class="flex-1 whitespace-pre-wrap break-words text-sm">
            {#if n.type === 'paramsfn'}
              <div><b>fn:</b> {n.props.fnName}({n.props.params?.join(', ')})</div>
            {:else if n.type === 'if'}
              <div><b>if</b> ({n.props.condition}) …</div>
            {:else if n.type === 'while'}
              <div><b>while</b> ({n.props.condition}) …</div>
            {:else if n.type === 'assign'}
              <div><b>assign:</b> {n.props.statement}</div>
            {/if}
          </div>
        </div>
      </button>
      <button
        type="button"
        class="shrink-0 rounded-lg border px-2 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
        aria-label={`Delete ${n.type} node`}
        onclick={() => remove(n.id)}
      >Delete</button>
    </div>
  </li>
{/if}
      <div
        class="h-4 mt-2 rounded border border-dashed border-transparent data-[active=true]:border-blue-400"
        ondragenter={() => setInsert(indexOfNode(n.id) + 1)}
        data-active={insertIndex === indexOfNode(n.id) + 1}
        aria-hidden="true"
      ></div>
    {/each}
  </ol>
</div>
<style>
  [aria-pressed='true'] {
    outline: 2px solid hsl(220 80% 60% / 0.9);
    outline-offset: 2px;
  }
</style>
