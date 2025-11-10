<script lang="ts">
  import QuizEngine from '$lib/quiz/QuizEngine.svelte';
  import { Quiz } from '$lib/quiz/model';
  import type { QuizDTO } from '$lib/quiz/types';
  import dpQuiz from '$lib/quiz/questions.json';

  const quiz = new Quiz(dpQuiz as QuizDTO);
</script>

<div class="page">
  <h1>Dinamikus programozás – Kvíz</h1>
  <QuizEngine {quiz} />
</div>
