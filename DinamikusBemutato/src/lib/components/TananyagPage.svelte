<script lang="ts">
  import type { Snippet } from 'svelte';
  type NavLink = {
    href?: string;
    label?: string;
  };
  type Props = {
    title: string;
    description?: string;
    backHref?: string;
    backLabel?: string;
    prev?: NavLink;
    next?: NavLink;
    children?: Snippet;
  };
  let {
    title,
    description = '',
    backHref = '/tananyag',
    backLabel = '← Vissza a tananyag listához',
    prev,
    next,
    children
  }: Props = $props();
  const prevHref = $derived(prev?.href ?? '/tananyag');
  const prevLabel = $derived(prev?.label ?? 'Előző anyag');
  const nextHref = $derived(next?.href ?? '/tananyag');
  const nextLabel = $derived(next?.label ?? 'Következő anyag');
</script>
<section class="page">
  <header class="hero">
    <h1>{title}</h1>
    {#if description}
      <p class="lead">{description}</p>
    {/if}
  </header>
  {#if backHref}
    <a href={backHref} class="back">
      {backLabel}
    </a>
  {/if}
  {#if children}
    <div class="content">
      {@render children()}
    </div>
  {/if}
  <nav class="pager">
    <a href={prevHref} class="nav-link prev">
      ← {prevLabel}
    </a>
    <a href={nextHref} class="nav-link next">
      {nextLabel} →
    </a>
  </nav>
</section>
<style>
  .page {
    max-width: 960px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }
  .hero h1 {
    font-size: 1.9rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .lead {
    max-width: 680px;
    line-height: 1.6;
    color: #444;
    font-size: 0.98rem;
  }
  .back {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.9rem;
    text-decoration: none;
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(0, 0, 0, 0.02);
    transition: background 0.12s ease, border-color 0.12s ease,
      transform 0.12s ease, box-shadow 0.12s ease;
  }
  .back:hover {
    background: #fff;
    border-color: rgba(0, 0, 0, 0.18);
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
  }
  .content {
    margin-top: 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    line-height: 1.6;
    color: #333;
    max-width: 760px;
  }
  .pager {
    margin-top: 1.5rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  .nav-link {
    flex: 1;
    padding: 0.75rem 0.9rem;
    border-radius: 0.9rem;
    text-decoration: none;
    font-size: 0.95rem;
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.06);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.12s ease, box-shadow 0.12s ease,
      background 0.12s ease, border-color 0.12s ease;
    white-space: nowrap;
  }
  .nav-link.prev {
    justify-content: flex-start;
  }
  .nav-link.next {
    justify-content: flex-end;
  }
  .nav-link:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.12);
  }
</style>
