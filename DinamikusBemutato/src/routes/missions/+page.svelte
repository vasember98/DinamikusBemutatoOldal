<script lang="ts">
  import MissionPanel from "$lib/components/MissionPanel.svelte";
  import NodePalette from "$lib/components/NodePalette.svelte";
  import SequenceCanvas from "$lib/components/SequenceCanvas.svelte";
  import type { CanvasEvent, NodeCreatePayload, NodeInstance } from "$lib/types/nodes";

  let nodes: NodeInstance[] = [];
  let selectedId: string | null = null;

  function handleCreate(e: NodeCreatePayload) {
    const id = crypto.randomUUID();
    nodes = [...nodes, { id, type: e.type, props: e.props } as NodeInstance];
    selectedId = id;
  }
  function handleCanvasEvent(e: CanvasEvent) {
    if (e.kind === "reorder") nodes = e.nodes;
    else if (e.kind === "delete") nodes = nodes.filter(n => n.id !== e.id);
    else if (e.kind === "select") selectedId = e.id;
    else if (e.kind === "updateProps") {
      nodes = nodes.map(n => n.id === e.id ? { ...n, props: (e as any).props } : n);
    }
  }
</script>

<div
  class="w-full grid grid-cols-1
         md:grid-cols-[minmax(0,1fr)_clamp(16rem,22vw,26rem)]
         gap-6 md:gap-8 py-4"
>
  <!-- left -->
  <section class="min-w-0 md:pr-6 px-4 md:px-6">
    <div><MissionPanel onRunChecks={() => {}} /></div>
    <div><SequenceCanvas {nodes} {selectedId} onCanvasEvent={handleCanvasEvent} /></div>
  </section>

  <!-- right: palette with visual separator and independent scroll -->
  <aside
    class="min-w-0 md:border-l md:border-neutral-200 dark:md:border-neutral-800 md:pl-6 px-4 md:px-6"
    style="max-height: calc(100dvh - 3.5rem); overflow: auto;"
  >
    <NodePalette onCreateNode={handleCreate} />
  </aside>
</div>
