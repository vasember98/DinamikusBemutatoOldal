<script lang="ts">
  import type { PageData } from './$types';
  const { data } = $props<{ data: PageData }>();
  type QuestionRow = (typeof data.questions)[number];
  const questions = data.questions as QuestionRow[];
  function formatType(t: string): string {
    switch (t) {
      case 'single_choice':
        return 'Egyválaszos';
      case 'multiple_choice':
        return 'Többválaszos';
      case 'true_false':
        return 'Igaz / hamis';
      case 'match_pairs':
        return 'Összepárosítás';
      default:
        return t;
    }
  }
  function formatDifficulty(d: string | null): string {
    if (!d) return '';
    if (d === 'easy') return 'Könnyű';
    if (d === 'medium') return 'Közepes';
    if (d === 'hard') return 'Nehéz';
    return d;
  }
  function formatDate(d: Date | string | null): string {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('hu-HU');
  }
</script>
<div class="max-w-5xl mx-auto p-4 space-y-6">
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-2xl font-bold">Kvíz kérdések</h1>
    <a
      href="/kviz-keszito"
      class="border rounded px-4 py-2 text-sm font-medium hover:bg-gray-100"
    >
      + Új kérdés létrehozása
    </a>
  </div>
  {#if questions.length === 0}
    <p class="text-sm text-gray-600">
      Még nincs egy kérdés sem az adatbázisban.
    </p>
  {:else}
    <div class="overflow-x-auto border rounded-lg">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left">
            <th class="px-3 py-2 border-b">ID</th>
            <th class="px-3 py-2 border-b">Külső ID</th>
            <th class="px-3 py-2 border-b">Téma</th>
            <th class="px-3 py-2 border-b">Típus</th>
            <th class="px-3 py-2 border-b">Nehézség</th>
            <th class="px-3 py-2 border-b">QuizSet</th>
            <th class="px-3 py-2 border-b">Létrehozva</th>
            <th class="px-3 py-2 border-b text-right">Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {#each questions as q}
            <tr class="odd:bg-white even:bg-gray-50">
              <td class="px-3 py-2 border-b align-top">
                {q.id}
              </td>
              <td class="px-3 py-2 border-b align-top">
                <span class="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {q.externalId}
                </span>
              </td>
              <td class="px-3 py-2 border-b align-top">
                {q.topic}
              </td>
              <td class="px-3 py-2 border-b align-top">
                {formatType(q.type)}
              </td>
              <td class="px-3 py-2 border-b align-top">
                {formatDifficulty(q.difficulty)}
              </td>
              <td class="px-3 py-2 border-b align-top">
                <div class="flex flex-col">
                  <span class="text-xs">
                    Set #{q.quizSetId}
                  </span>
                  {#if q.quizSetVersion || q.quizSetSource}
                    <span class="text-xs text-gray-500">
                      v{q.quizSetVersion ?? '–'}
                      {#if q.quizSetSource}
                        · {q.quizSetSource}
                      {/if}
                    </span>
                  {/if}
                </div>
              </td>
              <td class="px-3 py-2 border-b align-top">
                <span class="text-xs text-gray-500">
                  {formatDate(q.createdAt as any)}
                </span>
              </td>
              <td class="px-3 py-2 border-b align-top text-right">
                <a
                  href={`/kviz-keszito?questionId=${q.id}`}
                  class="inline-flex items-center gap-1 text-xs border rounded px-2 py-1 hover:bg-gray-100"
                >
                  ✏️ Szerkesztés
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
