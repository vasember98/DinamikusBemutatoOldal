<script lang="ts">
  import type {
    NodeCreatePayload, NodeType,
    InputProps, OutputProps, ParamsFnProps, IfProps, WhileProps, AssignProps
  } from "$lib/types/nodes";

  let { onCreateNode } = $props<{ onCreateNode?: (payload: NodeCreatePayload) => void }>();
  let tab = $state<'base'|'saved'>('base');

  const defaults = {
    input:    { name: 'x', value: [] } as InputProps,
    output:   { expr: 'out' } as OutputProps,
    paramsfn: { fnName: 'f', params: ['x'] } as ParamsFnProps,
    if:       { condition: 'true' } as IfProps,
    while:    { condition: 'false' } as WhileProps,
    assign:   { statement: 'i = 0' } as AssignProps
  } satisfies Record<NodeType, any>;

  function add(type: NodeType) {
    switch (type) {
      case 'input':    onCreateNode?.({ type: 'input',    props: defaults.input }); break;
      case 'output':   onCreateNode?.({ type: 'output',   props: defaults.output }); break;
      case 'paramsfn': onCreateNode?.({ type: 'paramsfn', props: defaults.paramsfn }); break;
      case 'if':       onCreateNode?.({ type: 'if',       props: defaults.if }); break;
      case 'while':    onCreateNode?.({ type: 'while',    props: defaults.while }); break;
      case 'assign':   onCreateNode?.({ type: 'assign',   props: defaults.assign }); break;
    }
  }
</script>




<div class="space-y-3">
<div role="tablist" aria-label="Palette tabs" class="flex gap-1">
<button role="tab" aria-selected={tab==='base'} class="px-3 py-1.5 rounded-lg text-sm border border-neutral-300 dark:border-neutral-700"
onclick={() => tab='base'}>Base</button>
<button role="tab" aria-selected={tab==='saved'} class="px-3 py-1.5 rounded-lg text-sm border border-neutral-300 dark:border-neutral-700"
onclick={() => tab='saved'}>Saved</button>
</div>


{#if tab === 'base'}
<div aria-label="Base nodes" class="grid gap-2">
<button type="button" class="w-full text-left px-3 py-2 rounded-xl border hover:bg-neutral-50 dark:hover:bg-neutral-900" onclick={() => add('input')}>Input</button>
<button type="button" class="w-full text-left px-3 py-2 rounded-xl border hover:bg-neutral-50 dark:hover:bg-neutral-900" onclick={() => add('output')}>Output</button>
<button type="button" class="w-full text-left px-3 py-2 rounded-xl border hover:bg-neutral-50 dark:hover:bg-neutral-900" onclick={() => add('paramsfn')}>Parameters → Function</button>
<button type="button" class="w-full text-left px-3 py-2 rounded-xl border hover:bg-neutral-50 dark:hover:bg-neutral-900" onclick={() => add('if')}>If</button>
<button type="button" class="w-full text-left px-3 py-2 rounded-xl border hover:bg-neutral-50 dark:hover:bg-neutral-900" onclick={() => add('while')}>While</button>
<button type="button" class="w-full text-left px-3 py-2 rounded-xl border hover:bg-neutral-50 dark:hover:bg-neutral-900" onclick={() => add('assign')}>Assign</button>
</div>
{:else}
<div class="text-sm text-neutral-500">Saved snippets will appear here later.</div>
{/if}
</div>