<script lang="ts">
	import type { CanvasEvent, NodeInstance } from '$lib/types/nodes';
	let {
		nodes = [],
		selectedId = null,
		onCanvasEvent
	} = $props<{
		nodes?: NodeInstance[];
		selectedId?: string | null;
		onCanvasEvent?: (ev: CanvasEvent) => void;
	}>();

	function select(id: string) {
		onCanvasEvent?.({ kind: 'select', id });
	}
	function remove(id: string) {
		onCanvasEvent?.({ kind: 'delete', id });
	}
</script>

<div class="max-w-none">
  <ol class="grid gap-2" aria-label="Sequence steps">
        {#each nodes as n (n.id)}
			<li class="rounded-xl border p-2">
				<div class="flex items-start gap-3">
					<!-- Primary interactive surface: a real button for selection -->
					<button
						type="button"
						class="flex-1 rounded-lg px-2 py-2 text-left hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-neutral-900"
						aria-pressed={selectedId === n.id}
						onclick={() => select(n.id)}
					>
						<div class="flex items-start gap-3">
							<div class="mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-xs">{n.type}</div>
							<div class="flex-1 whitespace-pre-wrap break-words text-sm">
								{#if n.type === 'input'}
									<div><b>name:</b> {n.props.name}</div>
								{:else if n.type === 'output'}
									<div><b>expr:</b> {n.props.expr}</div>
								{:else if n.type === 'paramsfn'}
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

					<!-- Separate explicit Delete button -->
					<button
						type="button"
						class="shrink-0 rounded-lg border px-2 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
						aria-label={`Delete ${n.type} node`}
						onclick={() => remove(n.id)}
					>
						Delete
					</button>
				</div>
			</li>
		{/each}
	</ol>
</div>

<style>
	/* Visual selected state on the primary button */
	[aria-pressed='true'] {
		outline: 2px solid hsl(220 80% 60% / 0.9);
		outline-offset: 2px;
	}
</style>
