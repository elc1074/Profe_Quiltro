<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import BaseButton from '../components/BaseButton.vue'
import StatusBadge from '../components/StatusBadge.vue'
import MascotFull from '../components/MascotFull.vue'

const { t } = useI18n()
const router = useRouter()
const quiz = useQuizStore()

onMounted(() => {
  if (!quiz.result) router.replace('/')
})

const result = computed(() => quiz.result)
const counts = computed(() => {
  if (!result.value) return { correct: 0, incorrect: 0, unanswered: 0 }
  return result.value.questions.reduce(
    (acc, q) => {
      acc[q.status] += 1
      return acc
    },
    { correct: 0, incorrect: 0, unanswered: 0 }
  )
})

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function startNewQuiz() {
  quiz.resetQuiz()
  router.push('/enviar')
}
</script>

<template>
  <div v-if="result" class="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
    <h1 class="text-2xl font-semibold text-lagoon dark:text-cream-soft sm:text-3xl">{{ t('result.title') }}</h1>

    <div class="mt-6 flex flex-col items-center rounded-blob bg-blush-soft px-6 py-10 text-center dark:bg-lagoon-light/40">
      <p class="text-sm font-semibold uppercase tracking-wide text-rosewood/80">{{ t('result.totalScoreLabel') }}</p>
      <p class="mt-1 font-display text-5xl font-bold text-lagoon dark:text-cream-soft">
        {{ result.totalScore }}<span class="text-2xl text-lagoon/40 dark:text-cream-soft/40">/{{ result.maxScore }}</span>
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <span class="rounded-full bg-success-bg px-4 py-1.5 text-sm font-semibold text-success dark:bg-success-bgDark dark:text-sage-light">{{ counts.correct }} {{ t('result.correct') }}</span>
        <span class="rounded-full bg-error-bg px-4 py-1.5 text-sm font-semibold text-error dark:bg-error-bgDark dark:text-blush">{{ counts.incorrect }} {{ t('result.incorrect') }}</span>
        <span class="rounded-full bg-warning-bg px-4 py-1.5 text-sm font-semibold text-warning dark:bg-warning-bgDark">{{ counts.unanswered }} {{ t('result.unanswered') }}</span>
      </div>
    </div>

    <h2 class="mt-10 font-display text-lg font-semibold text-lagoon dark:text-cream-soft">{{ t('result.questionsTitle') }}</h2>

    <div class="mt-4 space-y-4">
      <details
        v-for="(q, index) in result.questions"
        :key="q.id"
        class="group rounded-xl2 bg-cream p-5 shadow-soft open:pb-6 dark:bg-lagoon-light/40 dark:shadow-softDark"
        :open="index === 0"
      >
        <summary class="flex cursor-pointer list-none items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lagoon/10 font-display text-sm font-semibold text-lagoon dark:bg-cream-soft/10 dark:text-cream-soft">{{ index + 1 }}</span>
            <p class="font-semibold text-lagoon dark:text-cream-soft">{{ q.prompt }}</p>
          </div>
          <svg class="shrink-0 transition-transform group-open:rotate-180" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </summary>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <StatusBadge :status="q.status" />
          <span class="text-sm text-lagoon/55 dark:text-cream-soft/55">{{ q.score }}/{{ q.maxScore }} pts</span>
          <span class="flex items-center gap-1 text-sm text-lagoon/55 dark:text-cream-soft/55">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
            {{ t('result.timeSpent') }}: {{ formatTime(q.durationSeconds) }}
          </span>
        </div>

        <div class="mt-4 space-y-3 text-sm">
          <div class="rounded-lg bg-cream-soft p-3 dark:bg-lagoon-soft/50">
            <p class="font-semibold text-lagoon/70 dark:text-cream-soft/70">{{ t('result.yourAnswer') }}</p>
            <p class="mt-1 text-lagoon/60 dark:text-cream-soft/60">
              {{ q.status === 'unanswered' ? t('result.noAnswer') : q.studentAnswerLabel }}
            </p>
          </div>
          <div class="rounded-lg bg-cream-soft p-3 dark:bg-lagoon-soft/50">
            <p class="font-semibold text-lagoon/70 dark:text-cream-soft/70">{{ t('result.expectedAnswer') }}</p>
            <p class="mt-1 text-lagoon/60 dark:text-cream-soft/60">{{ q.expectedAnswer }}</p>
          </div>
          <div class="rounded-lg bg-sage/10 p-3 dark:bg-sage/10">
            <p class="font-semibold text-sage-dark dark:text-sage-light">{{ t('result.feedback') }}</p>
            <p class="mt-1 text-lagoon/70 dark:text-cream-soft/70">{{ q.feedback }}</p>
          </div>
        </div>
      </details>
    </div>

    <div class="mt-10 flex flex-col items-center gap-3 rounded-blob bg-cream py-10 text-center dark:bg-lagoon-light/30">
      <MascotFull :size="160" />
      <p class="font-display font-semibold text-lagoon dark:text-cream-soft">{{ t('result.mascotCaption') }}</p>
    </div>

    <div class="mt-8 flex flex-col items-center gap-2">
      <BaseButton size="lg" @click="startNewQuiz">{{ t('result.newQuiz') }}</BaseButton>
      <p class="text-xs text-lagoon/45 dark:text-cream-soft/45">{{ t('result.historySoon') }}</p>
    </div>
  </div>
</template>
