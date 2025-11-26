<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
  const { basePath, chapters } = data;
</script>
<svelte:head>
  <title>Tananyag – Dinamikus programozás</title>
  <meta
    name="description"
    content="Összegyűjtött tananyag a mohó stratégiától a dinamikus programozás klasszikus feladataiig: kincs, pénzváltás, LCS, toronyépítés, kemence, tükörszó, rúd darabolás, hátizsák és további feladatok."
  />
</svelte:head>
<section class="page">
  <header class="hero">
    <h1>Tananyag – Dinamikus programozás &amp; társai</h1>
    <p>
      Ezen az oldalon találod a dinamikus programozáshoz kapcsolódó
      tematikusan rendezett anyagokat.
      Minden fejezet egy külön oldalra visz, ahol rövid elmélet, példa
      és (később) interaktív magyarázat segít a feladatok megértésében.
    </p>
  </header>
  <section class="list">
    <h2>Elérhető témák</h2>
    <ul>
      {#each chapters as chapter}
        <li>
          <a href={chapter.path}>
            <strong>{chapter.title}</strong>
            {#if chapter.summary}
              <span class="summary">
                {chapter.summary}
              </span>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </section>
</section>
<style>
  .page {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.25rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .hero h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  .hero p {
    max-width: 52rem;
    line-height: 1.6;
  }
  .list h2 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.5rem;
  }
  li a {
    display: block;
    padding: 0.5rem 0.6rem;
    border-radius: 0.5rem;
    text-decoration: none;
    border: 1px solid transparent;
    transition: 0.15s ease all;
  }
  li a:hover {
    border-color: rgba(0,0,0,0.15);
    background: rgba(0,0,0,0.02);
  }
  .summary {
    display: block;
    font-size: 0.85rem;
    color: #555;
    margin-top: 0.1rem;
  }
</style>
