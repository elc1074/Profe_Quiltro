<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import MascotLogo from '../components/MascotLogo.vue'
import ErrorState from '../components/ErrorState.vue'

const { t } = useI18n()
const router = useRouter()
const quiz = useQuizStore()
const error = ref('')

async function grade() {
  error.value = ''
  if (!quiz.generated) {
    router.replace('/enviar')
    return
  }
  try {
    await quiz.submitForGrading()
    router.push('/resultado')
  } catch (reason) {
    error.value = reason.message || t('error.body')
  }
}

onMounted(() => {
  grade()
})
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:py-32">
    <ErrorState v-if="error" :body="error" @retry="grade" />
    <template v-else>
    <div class="relative mb-6 grid h-24 w-24 place-items-center rounded-full bg-sage/20 dark:bg-sage/15">
      <div class="absolute inset-0 animate-spin rounded-full border-4 border-sage/20 border-t-sage" style="animation-duration: 1.2s"></div>
      <MascotLogo :size="52" />
    </div>
    <h1 class="font-display text-2xl font-semibold text-lagoon dark:text-cream-soft">{{ t('grading.title') }}</h1>
    <p class="mt-2 text-sm text-lagoon/65 dark:text-cream-soft/65">{{ t('grading.subtitle') }}</p>
    </template>
  </div>
</template>
