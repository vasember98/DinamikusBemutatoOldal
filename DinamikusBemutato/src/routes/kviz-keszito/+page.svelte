<!-- src/routes/kviz-keszito/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import type {
    Difficulty,
    QuestionType,
    QuizQuestion,
    QuizSet
  } from '$lib/quiz/types.ts';

  // ⬇⬇⬇ Runes-style props ⬇⬇⬇
  const { data } = $props<{ data: PageData }>();
  // ⬆⬆⬆ NINCS export let ⬆⬆⬆

  // ---- Konstansok ----
  const questionTypes: { value: QuestionType; label: string }[] = [
    { value: 'single_choice', label: 'Egyválaszos feleletválasztó' },
    { value: 'multiple_choice', label: 'Többválaszos feleletválasztó' },
    { value: 'true_false', label: 'Igaz / hamis' },
    { value: 'match_pairs', label: 'Összepárosítás' }
  ];

  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: 'Könnyű' },
    { value: 'medium', label: 'Közepes' },
    { value: 'hard', label: 'Nehéz' }
  ];

  // ---- Szerver adatok ----
  type QuizSetSummary = (typeof data.quizSets)[number];
  const quizSets = data.quizSets as QuizSetSummary[];
  const editingQuestionFromServer = data.editQuestion;

  
  
  // ---- Állapotok (runes) ----
  let editingQuestionId = $state<number | null>(
    editingQuestionFromServer ? editingQuestionFromServer.question.id : null
  );

  let selectedQuizSetMode = $state<'existing' | 'new'>(
    editingQuestionFromServer ? 'existing' : (quizSets.length > 0 ? 'existing' : 'new')
  );

  let selectedQuizSetIdStr = $state<string>(
    editingQuestionFromServer
      ? String(editingQuestionFromServer.question.quizSetId)
      : (quizSets.length > 0 ? String(quizSets[0].id) : '')
  );

  let quizSetMeta = $state<QuizSet>({
    version: '1.0',
    source: 'DP.pdf',
    language: 'hu',
    questions: []
  });

  type OptionRow = { logicalId: string; text: string; isCorrect: boolean; };
  type MatchRow = { left: string; right: string; };

  let currentQuestionBase = $state({
    externalId: '',
    topic: '',
    type: 'true_false' as QuestionType,
    prompt: '',
    explanation: '',
    difficulty: '' as '' | Difficulty
  });

  let optionRows = $state<OptionRow[]>([]);
  let matchRows = $state<MatchRow[]>([]);
  let trueFalseAnswer = $state<boolean>(true);

  // ---- Helpers ----
  function resetTypeSpecificState(type: QuestionType) {
    if (type === 'true_false') {
      trueFalseAnswer = true;
      optionRows = [];
      matchRows = [];
    } else if (type === 'single_choice' || type === 'multiple_choice') {
      optionRows = [];
      matchRows = [];
      trueFalseAnswer = true;
    } else if (type === 'match_pairs') {
      matchRows = [];
      optionRows = [];
      trueFalseAnswer = true;
    }
  }

  // EDIT init csak egyszer (runes)
  let _initialized = $state(false);
  $effect.pre(() => {
    if (_initialized) return;
    if (!editingQuestionFromServer) { _initialized = true; return; }

    const q = editingQuestionFromServer.question;
    resetTypeSpecificState(q.type as QuestionType);

    currentQuestionBase = {
      externalId: q.externalId,
      topic: q.topic,
      type: q.type as QuestionType,
      prompt: q.prompt,
      explanation: q.explanation ?? '',
      difficulty: (q.difficulty ?? '') as '' | Difficulty
    };

    type LoadedOption = {
  id: number;
  logicalId: string;
  text: string;
  sortOrder: number;
};

    if (q.type === 'true_false') {
  trueFalseAnswer = Boolean(q.answer);
} else if (q.type === 'single_choice' || q.type === 'multiple_choice') {
  const ans = q.answer;
  const isArray = Array.isArray(ans);

  const loadedOptions = editingQuestionFromServer.options as LoadedOption[];

  optionRows = loadedOptions
    .slice()
    .sort((a: LoadedOption, b: LoadedOption) => a.sortOrder - b.sortOrder)
    .map((opt: LoadedOption): OptionRow => {
      const id = opt.logicalId;
      const isCorrect =
        q.type === 'single_choice'
          ? ans === id
          : isArray
            ? (ans as (number | string)[]).includes(id)
            : false;

      return { logicalId: id, text: opt.text, isCorrect };
    });
} else if (q.type === 'match_pairs') {
  const pairs = q.pairs as { left: string[]; right: string[] } | null;
  matchRows = [];
  if (pairs) {
    const maxLen = Math.max(pairs.left.length, pairs.right.length);
    for (let i = 0; i < maxLen; i++) {
      matchRows.push({ left: pairs.left[i] ?? '', right: pairs.right[i] ?? '' });
    }
  }
}


    _initialized = true;
  });

  // ---- Derived ----
  const selectedQuizSetId = $derived.by(() =>
    selectedQuizSetMode === 'existing' && selectedQuizSetIdStr
      ? Number(selectedQuizSetIdStr)
      : null
  );

  const answer = $derived.by(() => {
    if (currentQuestionBase.type === 'true_false') return trueFalseAnswer;

    if (currentQuestionBase.type === 'single_choice') {
      const correct = optionRows.find((o) => o.isCorrect);
      return correct ? correct.logicalId : '';
    }

    if (currentQuestionBase.type === 'multiple_choice') {
      return optionRows.filter((o) => o.isCorrect).map((o) => o.logicalId);
    }

    if (currentQuestionBase.type === 'match_pairs') {
      const obj: Record<string, string> = {};
      for (const row of matchRows) {
        if (row.left && row.right) obj[row.left] = row.right;
      }
      return obj;
    }

    return '';
  });

  const pairs = $derived.by(() => {
    if (currentQuestionBase.type !== 'match_pairs') return undefined;
    return {
      left: matchRows.map((r) => r.left).filter(Boolean),
      right: matchRows.map((r) => r.right).filter(Boolean)
    };
  });

  const questionPreview = $derived.by<QuizQuestion>(() => {
    const base: QuizQuestion = {
      id: currentQuestionBase.externalId || '',
      topic: currentQuestionBase.topic,
      type: currentQuestionBase.type,
      prompt: currentQuestionBase.prompt,
      answer,
      explanation: currentQuestionBase.explanation || undefined,
      difficulty: currentQuestionBase.difficulty === '' ? undefined : currentQuestionBase.difficulty
    };
    if (currentQuestionBase.type === 'single_choice' || currentQuestionBase.type === 'multiple_choice') {
      base.options = optionRows.map((row) => ({ id: row.logicalId, text: row.text }));
    }
    if (currentQuestionBase.type === 'match_pairs' && pairs) base.pairs = pairs;
    return base;
  });

  const quizSetPreview = $derived.by<QuizSet>(() => ({
    version: quizSetMeta.version,
    source: quizSetMeta.source,
    language: quizSetMeta.language,
    questions: [questionPreview]
  }));

  // ---- Típus-specifikus UI helpers ----
  function addOptionRow() {
    optionRows.push({ logicalId: String(optionRows.length + 1), text: '', isCorrect: false });
  }
  function removeOptionRow(index: number) { optionRows.splice(index, 1); }
  function toggleSingleCorrect(index: number) { optionRows.forEach((o, i) => (o.isCorrect = i === index)); }
  function toggleMultiCorrect(index: number) { optionRows[index].isCorrect = !optionRows[index].isCorrect; }
  function addMatchRow() { matchRows.push({ left: '', right: '' }); }
  function removeMatchRow(index: number) { matchRows.splice(index, 1); }

  // ---- Mentés ----
  let saveResult = $state<string | null>(null);
  let saving = $state(false);

  async function saveToBackend() {
    saveResult = null;
    saving = true;
    try {
      const payload: any = {
        mode: editingQuestionId ? 'update' : 'create',
        quizSetMeta: {
          version: quizSetMeta.version,
          source: quizSetMeta.source,
          language: quizSetMeta.language
        },
        question: questionPreview
      };

      if (editingQuestionId && editingQuestionFromServer) {
        payload.quizSetId = editingQuestionFromServer.question.quizSetId;
        payload.questionId = editingQuestionId;
      } else if (selectedQuizSetMode === 'existing' && selectedQuizSetId) {
        payload.quizSetId = selectedQuizSetId;
      }

      const res = await fetch('/kviz-keszito', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const ct = res.headers.get('content-type') ?? '';
        let msg = '';
        if (ct.includes('application/json')) {
          const data = await res.json().catch(() => null);
          msg = (data as any)?.error ?? JSON.stringify(data);
        } else {
          const text = await res.text();
          msg = text.slice(0, 200) + (text.length > 200 ? '…' : '');
        }
        saveResult = `Hiba: ${res.status} – ${msg}`;
        return;
      }

      const dataRes = await res.json();
      saveResult = `Siker: mód=${dataRes.mode ?? 'create'}; quizQuestionId=${dataRes.quizQuestionId}, quizSetId=${dataRes.quizSetId}`;
    } catch (err) {
      saveResult = `Hálózati hiba: ${(err as Error).message}`;
    } finally {
      saving = false;
    }
  }
</script>

<div class="max-w-4xl mx-auto p-4 space-y-6">
  <h1 class="text-2xl font-bold mb-2">Quiz kérdés szerkesztő</h1>

  {#if editingQuestionId}
    <p class="text-sm text-blue-700 mb-2">
      Szerkesztés módban vagy – kérdés ID: {editingQuestionId}
    </p>
  {/if}

  <!-- QuizSet meta + mód választás -->
  <section class="border rounded-lg p-4 space-y-3">
    <h2 class="font-semibold text-lg">QuizSet meta</h2>

    <div class="space-y-2">
      <label class="flex items-center gap-2 text-sm">
        <input
          type="radio"
          name="quizset-mode"
          value="existing"
          disabled={!!editingQuestionId}
          checked={selectedQuizSetMode === 'existing'}
          onchange={() => (selectedQuizSetMode = 'existing')}
        />
        <span>Meglévő QuizSet használata</span>
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input
          type="radio"
          name="quizset-mode"
          value="new"
          disabled={!!editingQuestionId}
          checked={selectedQuizSetMode === 'new'}
          onchange={() => (selectedQuizSetMode = 'new')}
        />
        <span>Új QuizSet létrehozása (az alábbi meta alapján)</span>
      </label>
    </div>

    {#if selectedQuizSetMode === 'existing'}
      {#if quizSets.length === 0}
        <p class="text-sm text-gray-500">Nincs még egy QuizSet sem az adatbázisban.</p>
      {:else}
        <div class="flex flex-col gap-1 max-w-md">
          <label for="quizSelect" class="font-medium text-sm">QuizSet kiválasztása</label>
          <select
            id="quizSelect"
            class="border rounded px-2 py-1"
            value={selectedQuizSetIdStr}
            onchange={(e) => (selectedQuizSetIdStr = (e.target as HTMLSelectElement).value)}
            disabled={!!editingQuestionId}
          >
            {#each quizSets as qs}
              <option value={qs.id}>
                #{qs.id} – v{qs.version} ({qs.source ?? 'nincs source'})
              </option>
            {/each}
          </select>
        </div>
      {/if}
    {/if}

    {#if selectedQuizSetMode === 'new' && !editingQuestionId}
      <div class="grid gap-3 md:grid-cols-3 mt-3">
        <div class="flex flex-col gap-1">
          <label for="version" class="font-medium text-sm">Verzió</label>
          <input
            id="version"
            class="border rounded px-2 py-1"
            type="text"
            value={quizSetMeta.version}
            oninput={(e) => (quizSetMeta.version = (e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="flex flex-col gap-1 md:col-span-2">
          <label for="source" class="font-medium text-sm">Forrás (source)</label>
          <input
            id="source"
            class="border rounded px-2 py-1"
            type="text"
            placeholder="DP.pdf + DP_orai.pdf"
            value={quizSetMeta.source}
            oninput={(e) => (quizSetMeta.source = (e.target as HTMLInputElement).value)}
          />
        </div>
      </div>

      <div class="flex flex-col gap-1 w-32 mt-2">
        <label for="languageSelect" class="font-medium text-sm">Nyelv</label>
        <input id="languageSelect" class="border rounded px-2 py-1 bg-gray-100" type="text" value="hu" readonly />
      </div>
    {/if}
  </section>

  <!-- Kérdés alapadatok -->
  <section class="border rounded-lg p-4 space-y-4">
    <h2 class="font-semibold text-lg">Kérdés adatai</h2>

    <div class="grid gap-3 md:grid-cols-3">
      <div class="flex flex-col gap-1">
        <label for="externalId" class="font-medium text-sm">Külső ID (pl. DP-1)</label>
        <input
          id="externalId"
          class="border rounded px-2 py-1"
          type="text"
          value={currentQuestionBase.externalId}
          oninput={(e) => (currentQuestionBase.externalId = (e.target as HTMLInputElement).value)}
        />
      </div>

      <div class="flex flex-col gap-1 md:col-span-2">
        <label for="topic" class="font-medium text-sm">Téma (topic)</label>
        <input
          id="topic"
          class="border rounded px-2 py-1"
          type="text"
          value={currentQuestionBase.topic}
          oninput={(e) => (currentQuestionBase.topic = (e.target as HTMLInputElement).value)}
        />
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <div class="flex flex-col gap-1">
        <label for="type" class="font-medium text-sm">Típus</label>
        <select
          id="type"
          class="border rounded px-2 py-1"
          value={currentQuestionBase.type}
          onchange={(e) => {
            const t = (e.target as HTMLSelectElement).value as QuestionType;
            if (t !== currentQuestionBase.type) {
              currentQuestionBase.type = t;
              resetTypeSpecificState(t);
            }
          }}
        >
          {#each questionTypes as qt}
            <option value={qt.value}>{qt.label}</option>
          {/each}
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label for="difficulty" class="font-medium text-sm">Nehézség</label>
        <select
          id="difficulty"
          class="border rounded px-2 py-1"
          value={currentQuestionBase.difficulty}
          onchange={(e) => (currentQuestionBase.difficulty = (e.target as HTMLSelectElement).value as '' | Difficulty)}
        >
          <option value="">(nincs megadva)</option>
          {#each difficulties as d}
            <option value={d.value}>{d.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="flex flex-col gap-1">
      <label for="prompt" class="font-medium text-sm">Kérdés szövege (prompt)</label>
      <textarea
        id="prompt"
        rows="3"
        class="border rounded px-2 py-1"
        oninput={(e) => (currentQuestionBase.prompt = (e.target as HTMLTextAreaElement).value)}
      >{currentQuestionBase.prompt}</textarea>
    </div>

    <div class="flex flex-col gap-1">
      <label for="explanation" class="font-medium text-sm">Magyarázat (opcionális)</label>
      <textarea
        id="explanation"
        rows="2"
        class="border rounded px-2 py-1"
        oninput={(e) => (currentQuestionBase.explanation = (e.target as HTMLTextAreaElement).value)}
      >{currentQuestionBase.explanation}</textarea>
    </div>
  </section>

  <!-- Típus-specifikus rész -->
  <section class="border rounded-lg p-4 space-y-4">
    <h2 class="font-semibold text-lg">Típus-specifikus beállítások</h2>

    {#if currentQuestionBase.type === 'true_false'}
      <div class="flex gap-4">
        <label class="flex items-center gap-2">
          <input
            type="radio"
            name="truefalse"
            checked={trueFalseAnswer === true}
            onchange={() => (trueFalseAnswer = true)}
          />
          <span>Igaz</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            name="truefalse"
            checked={trueFalseAnswer === false}
            onchange={() => (trueFalseAnswer = false)}
          />
          <span>Hamis</span>
        </label>
      </div>

    {:else if currentQuestionBase.type === 'single_choice' || currentQuestionBase.type === 'multiple_choice'}
      <div class="flex justify-between items-center">
        <h3 class="font-medium">
          Opciók {currentQuestionBase.type === 'single_choice' ? '(egy helyes)' : '(több helyes)'}
        </h3>
        <button type="button" class="border rounded px-3 py-1 text-sm" onclick={addOptionRow}>
          + Opció hozzáadása
        </button>
      </div>

      {#if optionRows.length === 0}
        <p class="text-sm text-gray-500">Még nincs egy opció sem.</p>
      {/if}

      <div class="space-y-2">
        {#each optionRows as opt, index}
          <div class="flex items-center gap-2">
            <div class="w-16">
              <input
                class="border rounded px-2 py-1 w-full text-center"
                type="text"
                title="logicalId (pl. 1, A, a)"
                value={opt.logicalId}
                oninput={(e) => (opt.logicalId = (e.target as HTMLInputElement).value)}
              />
            </div>
            <input
              class="border rounded px-2 py-1 flex-1"
              type="text"
              placeholder="Válasz szövege"
              value={opt.text}
              oninput={(e) => (opt.text = (e.target as HTMLInputElement).value)}
            />

            {#if currentQuestionBase.type === 'single_choice'}
              <label class="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="singleCorrect"
                  checked={opt.isCorrect}
                  onchange={() => toggleSingleCorrect(index)}
                />
                Helyes
              </label>
            {:else}
              <label class="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={opt.isCorrect}
                  onchange={() => toggleMultiCorrect(index)}
                />
                Helyes
              </label>
            {/if}

            <button
              type="button"
              class="text-xs border rounded px-2 py-1"
              onclick={() => removeOptionRow(index)}
            >
              X
            </button>
          </div>
        {/each}
      </div>

    {:else if currentQuestionBase.type === 'match_pairs'}
      <div class="flex justify-between items-center">
        <h3 class="font-medium">Összepárosítás (bal ↔ jobb)</h3>
        <button type="button" class="border rounded px-3 py-1 text-sm" onclick={addMatchRow}>
          + Pár hozzáadása
        </button>
      </div>

      {#if matchRows.length === 0}
        <p class="text-sm text-gray-500">Még nincs egy pár sem.</p>
      {/if}

      <div class="space-y-2">
        {#each matchRows as row, index}
          <div class="grid grid-cols-2 gap-2 items-center">
            <input
              class="border rounded px-2 py-1"
              type="text"
              placeholder="Bal oldal elem"
              value={row.left}
              oninput={(e) => (row.left = (e.target as HTMLInputElement).value)}
            />
            <div class="flex gap-2">
              <input
                class="border rounded px-2 py-1 flex-1"
                type="text"
                placeholder="Jobb oldal elem"
                value={row.right}
                oninput={(e) => (row.right = (e.target as HTMLInputElement).value)}
              />
              <button
                type="button"
                class="text-xs border rounded px-2 py-1"
                onclick={() => removeMatchRow(index)}
              >
                X
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- JSON preview + mentés -->
  <section class="border rounded-lg p-4 space-y-3">
    <h2 class="font-semibold text-lg">JSON preview</h2>
    <p class="text-sm text-gray-600">
      Ez a JSON kompatibilis a <code>QuizSet</code>/<code>QuizQuestion</code> típusaiddal és a sémával.
    </p>

    <pre class="bg-gray-950 text-gray-100 text-xs p-3 rounded overflow-x-auto">
{JSON.stringify(quizSetPreview, null, 2)}
    </pre>

    <div class="flex items-center gap-3">
      <button
        type="button"
        class="border rounded px-4 py-2 text-sm font-medium"
        disabled={saving}
        onclick={saveToBackend}
      >
        {saving ? 'Mentés...' : 'Mentés adatbázisba (POST /kviz-keszito)'}
      </button>
      {#if saveResult}
        <p class="text-sm">{saveResult}</p>
      {/if}
    </div>
  </section>
</div>
