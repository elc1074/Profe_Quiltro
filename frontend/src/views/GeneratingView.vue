<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import MascotLogo from '../components/MascotLogo.vue'

const { t } = useI18n()
const router = useRouter()
const quiz = useQuizStore()

const stepKeys = ['generating.step1', 'generating.step2', 'generating.step3', 'generating.step4']
const activeStep = ref(0)
let stepTimer = null

onMounted(() => {
  if (!quiz.hasFile) {
    router.replace('/enviar')
    return
  }
  stepTimer = setInterval(() => {
    activeStep.value = Math.min(activeStep.value + 1, stepKeys.length - 1)
  }, 800)

  quiz.generateQuiz().then(() => {
    router.push('/quiz')
  })
})

onBeforeUnmount(() => clearInterval(stepTimer))
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:py-28">
    <div class="relative mb-6 grid h-24 w-24 place-items-center rounded-full bg-blush-soft dark:bg-lagoon-light/50">
      <div class="absolute inset-0 animate-spin rounded-full border-4 border-rosewood/20 border-t-rosewood" style="animation-duration: 1.4s"></div>
      <MascotLogo :size="52" />
    </div>

    <h1 class="font-display text-2xl font-semibold text-lagoon dark:text-cream-soft">{{ t('generating.title') }}</h1>
    <p class="mt-2 text-sm text-lagoon/65 dark:text-cream-soft/65">{{ t('generating.subtitle') }}</p>

    <ul class="mt-8 w-full space-y-3 text-left">
      <li
        v-for="(key, index) in stepKeys"
        :key="key"
        class="flex items-center gap-3 rounded-xl2 px-4 py-3 transition-colors"
        :class="index <= activeStep ? 'bg-sage/15 dark:bg-sage/15' : 'bg-cream dark:bg-lagoon-light/30'"
      >
        <span
          class="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold"
          :class="index <= activeStep ? 'bg-sage text-cream-soft' : 'bg-lagoon/10 text-lagoon/40 dark:bg-cream-soft/10 dark:text-cream-soft/40'"
        >
          <span v-if="index < activeStep">✓</span>
          <span v-else-if="index === activeStep" class="h-2 w-2 animate-pulse rounded-full bg-cream-soft"></span>
        </span>
        <span
          class="text-sm"
          :class="index <= activeStep ? 'font-semibold text-lagoon dark:text-cream-soft' : 'text-lagoon/45 dark:text-cream-soft/45'"
        >{{ t(key) }}</span>
      </li>
    </ul>

    <p class="mt-6 text-xs text-lagoon/45 dark:text-cream-soft/45">{{ t('generating.aiNote') }}</p>
  </div>
</template>
