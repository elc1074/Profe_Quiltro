<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import BaseButton from '../components/BaseButton.vue'
import AudioRecorder from '../components/AudioRecorder.vue'
import QuestionIndex from '../components/QuestionIndex.vue'
import UnansweredDialog from '../components/UnansweredDialog.vue'

const { t } = useI18n()
const router = useRouter()
const quiz = useQuizStore()

let ticker = null

onMounted(() => {
  if (!quiz.generated) {
    router.replace(quiz.hasFile ? '/gerando' : '/enviar')
    return
  }
  ticker = setInterval(() => quiz.tickCurrent(), 1000)
})
onBeforeUnmount(() => clearInterval(ticker))

const currentRecording = computed(() => quiz.recordings[quiz.currentQuestion?.id])

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function handleSubmitClick() {
  if (quiz.unansweredIds.length > 0) {
    quiz.showUnansweredDialog = true
  } else {
    proceedToGrading()
  }
}

function proceedToGrading() {
  quiz.showUnansweredDialog = false
  router.push('/corrigindo')
}

function reviewFirstUnanswered() {
  quiz.showUnansweredDialog = false
  const idx = quiz.questions.findIndex((q) => q.id === quiz.unansweredIds[0])
  if (idx >= 0) quiz.goTo(idx)
}
</script>

<template>
  <div v-if="quiz.currentQuestion" class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
    <QuestionIndex
      :questions="quiz.questions"
      :recordings="quiz.recordings"
      :current-index="quiz.currentIndex"
      @select="quiz.goTo($event)"
    />

    <div class="mt-6 flex items-center justify-between text-sm text-lagoon/55 dark:text-cream-soft/55">
      <span>{{ t('quiz.questionLabel', { current: quiz.currentIndex + 1, total: quiz.totalQuestions }) }}</span>
      <span class="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        {{ t('quiz.timer') }}: {{ formatTime(currentRecording.elapsed) }}
      </span>
    </div>

    <h1 class="mt-3 text-xl font-semibold leading-snug text-lagoon dark:text-cream-soft sm:text-2xl">
      {{ quiz.currentQuestion.prompt }}
    </h1>

    <div class="mt-6">
      <AudioRecorder
        :status="currentRecording.status"
        :question-id="quiz.currentQuestion.id"
        :audio-url="currentRecording.audioUrl"
        :transcript="currentRecording.transcript"
        @start="quiz.startRecording(quiz.currentQuestion.id)"
        @stop="quiz.stopRecording(quiz.currentQuestion.id, $event)"
        @delete="quiz.deleteRecording(quiz.currentQuestion.id)"
        @update-transcript="quiz.updateTranscript(quiz.currentQuestion.id, $event)"
      />
    </div>

    <div class="mt-8 flex items-center justify-between gap-3">
      <BaseButton variant="ghost" :disabled="quiz.currentIndex === 0" @click="quiz.prev()">
        {{ t('quiz.prev') }}
      </BaseButton>
      <BaseButton
        v-if="quiz.currentIndex < quiz.totalQuestions - 1"
        variant="secondary"
        @click="quiz.next()"
      >
        {{ t('quiz.next') }}
      </BaseButton>
      <BaseButton v-else variant="primary" @click="handleSubmitClick">
        {{ t('quiz.submit') }}
      </BaseButton>
    </div>

    <UnansweredDialog
      v-if="quiz.showUnansweredDialog"
      :count="quiz.unansweredIds.length"
      @review="reviewFirstUnanswered"
      @submit-anyway="proceedToGrading"
    />
  </div>
</template>
