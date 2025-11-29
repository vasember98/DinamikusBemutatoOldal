<script lang="ts">
  import QuizEngine from '$lib/quiz/QuizEngine.svelte';
  import { Quiz } from '$lib/quiz/model';
  import type { PageData } from './$types';

  const { data }: { data: PageData } = $props();
  const quiz = new Quiz(data.quizSet);
</script>
<div class="page">
  <QuizEngine {quiz} />
</div>
