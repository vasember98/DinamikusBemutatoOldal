<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData | null = null;

	let showRegister = false;
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
					<label for="login-username">Felhasználónév</label>
					<input
						id="login-username"
						name="username"
						type="text"
						required
						value={form?.username}
					/>
				</div>

				<div class="field">
					<label for="login-password">Jelszó</label>
					<input id="login-password" name="password" type="password" required />
				</div>

				<button type="submit">Belépés</button>
			</form>

			{#if form?.message}
				<p class="error">{form.message}</p>
			{/if}
		</section>

		<section class="card">
			<header class="card-header">
				<h2>Regisztráció</h2>
				<button
					type="button"
					class="toggle-btn"
					onclick={() => (showRegister = !showRegister)}
				>
					{showRegister ? 'Bezárás' : 'Mutasd'}
				</button>
			</header>

			<div class:collapsed={!showRegister} class="collapsible">
				<form method="POST" action="?/register" use:enhance>
					<div class="field">
						<label for="reg-username">Felhasználónév</label>
						<input
							id="reg-username"
							name="username"
							type="text"
							required={showRegister}
							value={form?.username}
						/>
					</div>

					<div class="field">
						<label for="reg-fullName">Teljes név (opcionális)</label>
						<input
							id="reg-fullName"
							name="fullName"
							type="text"
							value={form?.fullName}
						/>
					</div>

					<div class="field">
						<label for="reg-password">Jelszó</label>
						<input
							id="reg-password"
							name="password"
							type="password"
							required={showRegister}
						/>
					</div>

					<div class="field">
						<label for="reg-passwordConfirm">Jelszó megerősítése</label>
						<input
							id="reg-passwordConfirm"
							name="passwordConfirm"
							type="password"
							required={showRegister}
						/>
					</div>

					<button type="submit">Regisztráció</button>
				</form>

				{#if form?.registerMessage}
					<p class="error">{form.registerMessage}</p>
				{/if}
			</div>
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

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
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

	.toggle-btn {
		margin-top: 0;
		font-size: 0.8rem;
		padding: 0.25rem 0.7rem;
		border-radius: 999px;
		border: 1px solid #ccc;
		background: #f8f8f8;
	}

	.error {
		color: #c00;
		font-size: 0.9rem;
	}

	.collapsible {
		overflow: hidden;
		max-height: 1000px;
		transition: max-height 0.25s ease, opacity 0.25s ease, transform 0.25s ease;
		opacity: 1;
		transform: translateY(0);
	}

	.collapsed {
		max-height: 0;
		opacity: 0;
		transform: translateY(-4px);
		pointer-events: none;
	}
</style>
