<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  export let data;
  const user = data.user;
</script>
<div class="profile-page">
  <section class="card header">
    <div class="avatar-wrap">
      {#if $page.form?.action === 'updateProfile' && $page.form?.avatarUrl}
        <img src={$page.form.avatarUrl} alt="Avatar" class="avatar" />
      {:else if user.avatarUrl}
        <img src={user.avatarUrl} alt="Avatar" class="avatar" />
      {:else}
        <div class="avatar placeholder">
          <span>{(user.fullName || user.username || '?').slice(0, 2).toUpperCase()}</span>
        </div>
      {/if}
    </div>
    <div class="info">
      <h1>
        {#if $page.form?.action === 'updateProfile' && $page.form?.fullName}
          {$page.form.fullName}
        {:else}
          {user.fullName || user.username}
        {/if}
      </h1>
      <p class="muted">{user.email}</p>
    </div>
  </section>
  <section class="grid">
    <form
      class="card"
      method="POST"
      action="?/updateProfile"
      use:enhance
    >
      <h2>Profil adatok</h2>
      {#if $page.form?.action === 'updateProfile'}
        {#if $page.form.success}
          <div class="alert success">{$page.form.message}</div>
        {:else if $page.form.message}
          <div class="alert error">{$page.form.message}</div>
        {/if}
      {/if}
      <label>
        <span>Teljes név</span>
        <input
          name="fullName"
          type="text"
          value={
            $page.form?.action === 'updateProfile' && $page.form?.fullName !== undefined
              ? $page.form.fullName
              : user.fullName
          }
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          name="avatarUrl"
          type="url"
          placeholder="https://..."
          value={
            $page.form?.action === 'updateProfile' && $page.form?.avatarUrl !== undefined
              ? $page.form.avatarUrl
              : user.avatarUrl
          }
        />
      </label>
      <button class="btn primary">Mentés</button>
    </form>
    <form
      class="card"
      method="POST"
      action="?/changePassword"
      use:enhance
    >
      <h2>Biztonság</h2>
      <p class="muted small">Jelszó módosítása a jelenlegi fiókhoz.</p>
      {#if $page.form?.action === 'changePassword'}
        {#if $page.form.success}
          <div class="alert success">{$page.form.message}</div>
        {:else if $page.form.message}
          <div class="alert error">{$page.form.message}</div>
        {/if}
      {/if}
      <label>
        <span>Jelenlegi jelszó</span>
        <input type="password" name="current_password" autocomplete="current-password" />
      </label>
      <label>
        <span>Új jelszó</span>
        <input type="password" name="new_password" autocomplete="new-password" />
      </label>
      <label>
        <span>Új jelszó megerősítés</span>
        <input type="password" name="confirm_password" autocomplete="new-password" />
      </label>
      <button class="btn outline">Jelszó frissítése</button>
    </form>
  </section>
</div>
<style>
  .profile-page {
    max-width: 960px;
    margin: 2rem auto;
    padding: 0 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .card {
    background: #ffffff;
    border-radius: 1rem;
    padding: 1.25rem 1.5rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  }
  .header {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: center;
  }
  .avatar-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 999px;
    object-fit: cover;
    border: 2px solid #bfdbfe;
  }
  .avatar.placeholder {
    width: 72px;
    height: 72px;
    border-radius: 999px;
    background: #eff6ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #1f2937;
  }
  .info h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }
  .muted {
    color: #6b7280;
  }
  .small {
    font-size: 0.85rem;
  }
  .grid {
    display: grid;
    gap: 1.25rem;
    grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr);
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.6rem;
    font-size: 0.85rem;
    color: #6b7280;
  }
  input {
    padding: 0.5rem 0.7rem;
    border-radius: 0.6rem;
    border: 1px solid #d1d5db;
    font-size: 0.9rem;
    outline: none;
  }
  input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.18);
  }
  .btn {
    margin-top: 0.9rem;
    padding: 0.5rem 1.2rem;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    transition: all 0.12s ease;
  }
  .btn.primary {
    background: #3b82f6;
    color: #ffffff;
  }
  .btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.35);
  }
  .btn.outline {
    background: transparent;
    color: #111827;
    border: 1px solid #3b82f6;
  }
  .btn.outline:hover {
    background: #eff6ff;
  }
  .alert {
    margin-top: 0.5rem;
    padding: 0.5rem 0.7rem;
    border-radius: 0.6rem;
    font-size: 0.8rem;
  }
  .alert.error {
    background: #fee2e2;
    border: 1px solid #ef4444;
    color: #991b1b;
  }
  .alert.success {
    background: #dcfce7;
    border: 1px solid #22c55e;
    color: #166534;
  }
  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
