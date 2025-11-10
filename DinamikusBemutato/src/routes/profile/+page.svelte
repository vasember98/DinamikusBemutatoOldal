<svelte:options runes={true} />

<script>
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');
  let success = $state('');

  let editing = $state(false);

  // Main profile state
  let profile = $state({
    username: '',
    email: '',
    full_name: '',
    avatar_url: '',
    bio: ''
  });

  // Password form state
  let passwordForm = $state({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Load profile on mount
  $effect(() => {
  (async () => {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      profile = { ...profile, ...data };
    } catch (e) {
      error = e instanceof Error ? e.message : 'Could not load profile';
    } finally {
      loading = false;
    }
  })();
});
  function startEdit() {
    success = '';
    error = '';
    editing = true;
  }

  function cancelEdit() {
    editing = false;
    success = '';
    error = '';
    // Reload from server (simple version: reload page)
    location.reload();
  }

  async function saveProfile() {
    saving = true;
    error = '';
    success = '';

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: profile.username,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio
        })
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Failed to save profile');
      }

      success = 'Profile updated successfully.';
      editing = false;
    } catch (e) {
        error = e instanceof Error ? e.message : String(e);
    } finally {
      saving = false;
    }
  }

  async function changePassword() {
    error = '';
    success = '';

    if (!passwordForm.current_password || !passwordForm.new_password) {
      error = 'Fill in all password fields.';
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      error = 'New passwords do not match.';
      return;
    }

    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passwordForm)
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Failed to change password');
      }

      success = 'Password changed successfully.';
      passwordForm = {
        current_password: '',
        new_password: '',
        confirm_password: ''
      };
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  function avatarInitials() {
    const name = profile.full_name || profile.username || '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? '')
      .join('');
  }
</script>

{#if loading}
  <div class="page-wrapper">
    <div class="card">
      <p>Loading profile...</p>
    </div>
  </div>
{:else}
  <div class="page-wrapper">
    <section class="card header-card">
      <div class="avatar-wrapper">
        {#if profile.avatar_url}
          <img class="avatar" src={profile.avatar_url} alt="Avatar" />
        {:else}
          <div class="avatar placeholder">
            <span>{avatarInitials()}</span>
          </div>
        {/if}
      </div>

      <div class="header-info">
        <h1>{profile.full_name || profile.username || 'Your profile'}</h1>
        <p class="muted">{profile.email}</p>
        {#if profile.bio}
          <p class="bio-text">{profile.bio}</p>
        {/if}
      </div>

      <div class="header-actions">
        {#if editing}
          <button class="btn ghost" onclick={cancelEdit} disabled={saving}>Cancel</button>
          <button class="btn primary" onclick={saveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        {:else}
          <button class="btn primary" onclick={startEdit}>Edit profile</button>
        {/if}
      </div>
    </section>

    <section class="grid">
      <!-- Profile details / edit form -->
      <div class="card">
        <h2>Profile details</h2>

        {#if error}
          <div class="alert error">{error}</div>
        {/if}

        {#if success}
          <div class="alert success">{success}</div>
        {/if}

        {#if editing}
          <div class="form">
            <label>
              <span>Username</span>
              <input
                type="text"
                bind:value={profile.username}
                autocomplete="username"
              />
            </label>

            <label>
              <span>Full name</span>
              <input
                type="text"
                bind:value={profile.full_name}
                autocomplete="name"
              />
            </label>

            <label>
              <span>Email</span>
              <input
                type="email"
                bind:value={profile.email}
                autocomplete="email"
              />
            </label>

            <label>
              <span>Avatar URL</span>
              <input
                type="url"
                bind:value={profile.avatar_url}
                placeholder="https://..."
              />
            </label>

            <label>
              <span>Bio</span>
              <textarea
                rows="4"
                bind:value={profile.bio}
                placeholder="Tell something short about yourself..."
              ></textarea>
            </label>
          </div>
        {:else}
          <div class="readonly-list">
            <div>
              <span class="label">Username</span>
              <span class="value">{profile.username}</span>
            </div>
            <div>
              <span class="label">Full name</span>
              <span class="value">{profile.full_name || '—'}</span>
            </div>
            <div>
              <span class="label">Email</span>
              <span class="value">{profile.email}</span>
            </div>
            <div>
              <span class="label">Avatar URL</span>
              <span class="value">{profile.avatar_url || '—'}</span>
            </div>
            <div>
              <span class="label">Bio</span>
              <span class="value">{profile.bio || '—'}</span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Password change -->
      <div class="card">
        <h2>Security</h2>
        <p class="muted small">
          Change your password. This uses your backend endpoint and should be wired to your auth logic.
        </p>

        <div class="form">
          <label>
            <span>Current password</span>
            <input
              type="password"
              bind:value={passwordForm.current_password}
              autocomplete="current-password"
            />
          </label>

          <label>
            <span>New password</span>
            <input
              type="password"
              bind:value={passwordForm.new_password}
              autocomplete="new-password"
            />
          </label>

          <label>
            <span>Confirm new password</span>
            <input
              type="password"
              bind:value={passwordForm.confirm_password}
              autocomplete="new-password"
            />
          </label>

          <button class="btn outline" onclick={changePassword}>
            Update password
          </button>
        </div>
      </div>
    </section>
  </div>
{/if}

<style>
  .page-wrapper {
    max-width: 1024px;
    margin: 2rem auto;
    padding: 0 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card {
    background: #0f172a;
    border-radius: 1rem;
    padding: 1.25rem 1.5rem;
    border: 1px solid rgba(148, 163, 253, 0.15);
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.55);
    color: #e5e7eb;
  }

  .header-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1.25rem;
    align-items: center;
  }

  .avatar-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 999px;
    object-fit: cover;
    border: 2px solid rgba(129, 140, 248, 0.75);
  }

  .avatar.placeholder {
    width: 72px;
    height: 72px;
    border-radius: 999px;
    background: radial-gradient(circle at 0 0, #4f46e5, #111827);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.1rem;
    color: #e5e7eb;
  }

  .header-info h1 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 600;
    color: #e5e7eb;
  }

  .muted {
    color: #9ca3af;
  }

  .small {
    font-size: 0.85rem;
  }

  .bio-text {
    margin-top: 0.35rem;
    color: #9ca3af;
    font-size: 0.92rem;
  }

  .header-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
  }

  .btn {
    border-radius: 999px;
    padding: 0.45rem 1.1rem;
    border: none;
    font-size: 0.9rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease, border-color 0.12s ease;
    white-space: nowrap;
  }

  .btn.primary {
    background: linear-gradient(to right, #4f46e5, #6366f1);
    color: white;
    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.6);
  }

  .btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px rgba(79, 70, 229, 0.7);
  }

  .btn.ghost {
    background: transparent;
    color: #9ca3af;
    border: 1px solid rgba(148, 163, 253, 0.25);
  }

  .btn.ghost:hover {
    background: rgba(15, 23, 42, 0.9);
    color: #e5e7eb;
  }

  .btn.outline {
    background: transparent;
    color: #e5e7eb;
    border: 1px solid rgba(148, 163, 253, 0.45);
  }

  .btn.outline:hover {
    background: rgba(17, 24, 39, 0.96);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: default;
    transform: none;
    box-shadow: none;
  }

  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr);
    gap: 1.25rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-top: 0.5rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
    color: #9ca3af;
  }

  input,
  textarea {
    padding: 0.5rem 0.7rem;
    border-radius: 0.6rem;
    border: 1px solid rgba(75, 85, 99, 0.9);
    background: rgba(9, 9, 11, 0.95);
    color: #e5e7eb;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }

  input:focus,
  textarea:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.65);
    background: #020817;
  }

  .readonly-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .label {
    color: #6b7280;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .value {
    color: #e5e7eb;
  }

  .alert {
    margin: 0.4rem 0 0.6rem;
    padding: 0.5rem 0.7rem;
    border-radius: 0.6rem;
    font-size: 0.8rem;
  }

  .alert.error {
    background: rgba(127, 29, 29, 0.45);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fecaca;
  }

  .alert.success {
    background: rgba(22, 101, 52, 0.45);
    border: 1px solid rgba(34, 197, 94, 0.4);
    color: #bbf7d0;
  }

  @media (max-width: 768px) {
    .header-card {
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
    }

    .header-actions {
      flex-direction: row;
      justify-content: flex-start;
    }

    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
