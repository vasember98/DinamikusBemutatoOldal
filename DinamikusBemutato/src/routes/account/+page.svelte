<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData | null = null;
</script>

<div class="account-page">
	<h1>Fiók</h1>

	{#if data.user}
		<section class="card">
			<h2>Be vagy jelentkezve</h2>
			<p>
				<strong>
					{data.user.fullName ?? data.user.username ?? 'Ismert felhasználó'}
				</strong>
			</p>

			<form method="POST" action="?/logout" use:enhance>
				<button type="submit">Kijelentkezés</button>
			</form>
		</section>
	{:else}
		<section class="card">
			<h2>Bejelentkezés</h2>

			<form method="POST" action="?/login" use:enhance>
				<div class="field">
					<label for="username">Felhasználónév</label>
					<input
						id="username"
						name="username"
						type="text"
						required
						value={form?.username}
					/>
				</div>

				<div class="field">
					<label for="password">Jelszó</label>
					<input id="password" name="password" type="password" required />
				</div>

				<button type="submit">Belépés</button>
			</form>

			{#if form?.message}
				<p class="error">{form.message}</p>
			{/if}
		</section>
	{/if}
</div>

<style>
	.account-page {
		max-width: 400px;
		margin: 2rem auto;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.card {
		padding: 1.5rem;
		border-radius: 1rem;
		border: 1px solid rgba(0, 0, 0, 0.08);
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	input {
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid #ccc;
	}
	button {
		margin-top: 0.5rem;
		padding: 0.5rem 0.9rem;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
		font-weight: 600;
	}
	.error {
		color: #c00;
		font-size: 0.9rem;
	}
</style>
