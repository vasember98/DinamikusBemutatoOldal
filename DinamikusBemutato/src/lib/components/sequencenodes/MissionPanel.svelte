<script lang="ts">
const { title = "Mission: Transform your sequence", brief = "Build the algorithm using base blocks (Input, Output, Parameters→Function, If, While, Assign).", onRunChecks } = $props<{
title?: string;
brief?: string;
onRunChecks?: () => void;
}>();
</script>

<div class="w-full">
  <div class="px-0 py-3 flex items-center gap-3">  <!-- removed mx-auto/max-w-7xl -->
    <div class="flex-1 min-w-0">
      <h1 class="text-lg font-semibold truncate">{title}</h1>
      <p class="text-sm text-neutral-600 dark:text-neutral-400 whitespace-normal break-words leading-relaxed">
        {brief}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <button class="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
        onclick={() => onRunChecks?.()}>
        Run checks
      </button>
    </div>
  </div>
</div>
