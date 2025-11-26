<script lang="ts">
  import type { NodeId } from '$lib/diagram/types';
  import { getNode } from '$lib/diagram/store';
  import ZoneNode from './ZoneNode.svelte';
  import NodeBase from './NodeBase.svelte';
  type Props = { id: NodeId; class?: string };
  let { id, class: className = '' }: Props = $props();
  const rec = getNode(id);
</script>
{#if rec?.kind === 'zone'}
  <ZoneNode id={id} class={className} />
{:else}
  <NodeBase id={id} draggable class={`rounded-md border border-neutral-200 dark:border-neutral-800 px-2 py-1 text-sm ${className}`}>
    {#snippet children}
      <span>{rec?.name ?? id}</span>
    {/snippet}
  </NodeBase>
{/if}
