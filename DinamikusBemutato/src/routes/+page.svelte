<script lang="ts">
      import { page } from '$app/state';
   let user = $derived(page.data.user);

	let appName = 'Tananyag – Dinamikus programozás & társai';
	let intro =
		'Üdv a portálon! Itt éred el a tananyagokat, feladatokat és (később) az interaktív magyarázatokat.';

	function handleStart() {
        if(user){
            window.location.href = '/tananyag';
        }else{
            window.location.href = '/account';
        }
	}
</script>

<main class="page">
	<section class="hero">
		<div class="hero-title">
			<h1>{appName}</h1>
			<p>{intro}</p>
		</div>

		<div class="hero-actions">
            <button onclick={handleStart} class="primary-btn">
				Belépés a tananyaghoz
			</button>
			<div class="secondary">
				<p>Vagy válassz a felső menüből / oldalsávból.</p>
			</div>
		</div>
	</section>

	<section class="info">
		<h2>Mit találsz itt?</h2>
		<ul>
			<li>Tematikusan rendezett fejezetek kisebb magyarázatokkal.</li>
			<li>Feladatleírások, példák, vizsgára készüléshez használható anyagok.</li>
			<li>(Később) interaktív demók és vizuális magyarázatok.</li>
		</ul>
	</section>
</main>

<style>
	.page {
		min-height: 100vh;
		padding: 2rem 3rem;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		color: #111827;
		box-sizing: border-box;
	}

	.hero {
		max-width: 900px;
	}

	.hero-title h1 {
		font-size: 2.4rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
	}

	.hero-title p {
		margin: 0;
		font-size: 1rem;
		color: #6b7280;
	}

	.hero-actions {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.primary-btn {
		border: none;
		border-radius: 999px;
		padding: 0.75rem 1.6rem;
		font-size: 1rem;
		font-weight: 600;
		background: #111827;
		color: #ffffff;
		cursor: pointer;
		transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
		box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
	}

	.primary-btn:hover {
		background: #020817;
		transform: translateY(-1px);
		box-shadow: 0 10px 26px rgba(15, 23, 42, 0.16);
	}

	.secondary p {
		font-size: 0.9rem;
		color: #9ca3af;
		margin: 0;
	}

	.info {
		max-width: 900px;
		padding: 1.5rem 1.75rem;
		border-radius: 1rem;
        border-width: 0.25rem;
        border-color: #d0d1d3;
		background: #ffffff;
		box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
	}

	.info h2 {
		margin: 0 0 0.75rem;
		font-size: 1.2rem;
		font-weight: 600;
	}

	.info ul {
		margin: 0;
		padding-left: 1.1rem;
		color: #4b5563;
		font-size: 0.95rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
</style>
