<script lang="ts">
  import TananyagPage from '$lib/components/TananyagPage.svelte';
  import PdfSection from '$lib/components/PdfSection.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<TananyagPage
  title={data.chapter.title}
  description={data.chapter.summary}
  prev={data.prev}
  next={data.next}
>
  {#snippet children()}
    <h2>Miről szól ez a rész?</h2>
    <p>{data.chapter.summary}</p>

    {#each data.sources as src (src.file + '-' + src.fromSlide + '-' + src.toSlide)}
      <PdfSection
        file={src.file}
        fromPage={src.fromSlide}
        toPage={src.toSlide}
        title={`${data.chapter.title} – ${src.file} (${src.fromSlide}–${src.toSlide}. dia)`}
      />
    {/each}
  {/snippet}
</TananyagPage>
