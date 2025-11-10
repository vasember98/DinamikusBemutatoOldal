<!-- src/routes/tananyag/+page.svelte -->

<svelte:head>
  <title>Tananyag – Dinamikus programozás</title>
  <meta
    name="description"
    content="Összegyűjtött tananyag a mohó stratégiától a dinamikus programozás klasszikus feladataiig: kincs, pénzváltás, LCS, toronyépítés, kemence, tükörszó, rúd darabolás, hátizsák és további feladatok."
  />
</svelte:head>

<section class="page">
  <header class="hero">
    <h1>Tananyag – Dinamikus programozás & társai</h1>
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
      <li>
        <a href="/tananyag/moho-strategia">
          Mohó stratégia
        </a>
      </li>
      <li>
        <a href="/tananyag/dinamikus-programozas-alapok-es-strategia">
          Dinamikus programozás alapok és stratégia
        </a>
      </li>
      <li>
        <a href="/tananyag/kincs-utvonal-feladatok">
          Kincs / útvonal feladatok
        </a>
      </li>
      <li>
        <a href="/tananyag/penzvaltas-problemak">
          Pénzváltás problémák
        </a>
      </li>
      <li>
        <a href="/tananyag/leghosszabb-kozos-reszsorozat">
          Leghosszabb közös részsorozat (LCS)
        </a>
      </li>
      <li>
        <a href="/tananyag/toronyepites-feladat">
          Toronyépítés feladat
        </a>
      </li>
      <li>
        <a href="/tananyag/kemence-feladat">
          Kemence feladat
        </a>
      </li>
      <li>
        <a href="/tananyag/tukorszo">
          Tükörszó (palindrom beszúrás)
        </a>
      </li>
      <li>
        <a href="/tananyag/rud-darabolas-feladat">
          Rúd darabolás feladat
        </a>
      </li>
      <li>
        <a href="/tananyag/hatizsak-feladat">
          Hátizsák feladat
        </a>
      </li>
      <li>
        <a href="/tananyag/tovabbi-feladatok">
          További feladatok
        </a>
      </li>
    </ul>
  </section>
</section>

<style>
  .page {
    max-width: 960px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .hero h1 {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .hero p {
    line-height: 1.6;
    font-size: 0.98rem;
    color: #444;
  }

  .list h2 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 0.75rem;
  }

  li a {
    display: block;
    padding: 0.75rem 0.9rem;
    border-radius: 0.75rem;
    text-decoration: none;
    font-size: 0.98rem;
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.06);
    transition: transform 0.12s ease, box-shadow 0.12s ease,
      background 0.12s ease, border-color 0.12s ease;
  }

  li a:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.12);
  }
</style>
