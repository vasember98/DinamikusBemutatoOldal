<script lang="ts">
  import MissionPanel from "$lib/components/sequencenodes/MissionPanel.svelte";
  import NodePalette from "$lib/components/sequencenodes/NodePalette.svelte";
  import SequenceCanvas from "$lib/components/sequencenodes/SequenceCanvas.svelte";
  import type { CanvasEvent, NodeCreatePayload, NodeInstance } from "$lib/types/nodes";

  let nodes: NodeInstance[] = [];
  let selectedId: string | null = null;

  function insertAt<T>(arr: T[], index: number, item: T): T[] {
    const i = Math.max(0, Math.min(index, arr.length));
    return [...arr.slice(0, i), item, ...arr.slice(i)];
  }

  // Click-to-add from the palette
  function handleCreate(e: NodeCreatePayload) {
    const id = crypto.randomUUID();
    // provide safe defaults for known types so we never store undefined
    const props =
      e.type === 'input'  ? (e.props ?? { vars: {} }) :
      e.type === 'output' ? (e.props ?? { results: {} }) :
      e.props;

    nodes = [...nodes, { id, type: e.type, props } as NodeInstance];
    selectedId = id;
  }
  // Events from the canvas
  function handleCanvasEvent(e: CanvasEvent) {
   if (e.kind === "create") {
  const id = crypto.randomUUID();
  const at = typeof e.atIndex === "number" ? e.atIndex : nodes.length;

  let newNode: NodeInstance;
  switch (e.type) {
    case 'input':    newNode = { id, type: 'input',    props: e.props }; break;
    case 'output':   newNode = { id, type: 'output',   props: e.props }; break;
    case 'paramsfn': newNode = { id, type: 'paramsfn', props: e.props }; break;
    case 'if':       newNode = { id, type: 'if',       props: e.props }; break;
    case 'while':    newNode = { id, type: 'while',    props: e.props }; break;
    case 'assign':   newNode = { id, type: 'assign',   props: e.props }; break;
  }

  nodes = insertAt(nodes, at, newNode);
  selectedId = id;
}else if (e.kind === "reorder") {
      nodes = e.nodes;

    } else if (e.kind === "delete") {
      nodes = nodes.filter(n => n.id !== e.id);
      if (selectedId === e.id) selectedId = null;

    } else if (e.kind === "select") {
      selectedId = e.id;

    } else if (e.kind === "updateProps") {
      nodes = nodes.map(n => n.id === e.id ? { ...n, props: e.props as any } : n);
    }
  }
</script>

<div
  class="w-full grid grid-cols-1
         md:grid-cols-[minmax(0,1fr)_clamp(16rem,22vw,26rem)]
         gap-6 md:gap-8 py-4"
>
  <section class="min-w-0 md:pr-6 px-4 md:px-6">
    <div><MissionPanel onRunChecks={() => {}} /></div>
    <div><SequenceCanvas {nodes} {selectedId} onCanvasEvent={handleCanvasEvent} /></div>
  </section>

  <aside
    class="min-w-0 md:border-l md:border-neutral-200 dark:md:border-neutral-800 md:pl-6 px-4 md:px-6"
    style="max-height: calc(100dvh - 3.5rem); overflow: auto;"
  >
    <NodePalette onCreateNode={handleCreate} />
  </aside>
</div>
