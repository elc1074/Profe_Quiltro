<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import MascotLogo from '../components/MascotLogo.vue'

const { t } = useI18n()
const router = useRouter()
const quiz = useQuizStore()

onMounted(() => {
  if (!quiz.generated) {
    router.replace('/enviar')
    return
  }
  quiz.submitForGrading().then(() => {
    router.push('/resultado')
  })
})
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:py-32">
    <div class="relative mb-6 grid h-24 w-24 place-items-center rounded-full bg-sage/20 dark:bg-sage/15">
      <div class="absolute inset-0 animate-spin rounded-full border-4 border-sage/20 border-t-sage" style="animation-duration: 1.2s"></div>
      <MascotLogo :size="52" />
    </div>
    <h1 class="font-display text-2xl font-semibold text-lagoon dark:text-cream-soft">{{ t('grading.title') }}</h1>
    <p class="mt-2 text-sm text-lagoon/65 dark:text-cream-soft/65">{{ t('grading.subtitle') }}</p>
    <p class="mt-6 text-xs text-lagoon/40 dark:text-cream-soft/40">{{ t('grading.note') }}</p>
  </div>
</template>
