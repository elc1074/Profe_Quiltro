<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { KrokoLiveTranscription } from '../services/krokoLiveTranscription'
import KrokoLoadingDialog from './AudioLoadingDialog.vue'

const props = defineProps({
  status: { type: String, required: true }, // idle | recording | recorded
  audioUrl: { type: String, default: '' },
  transcript: { type: String, default: '' },
  questionId: { type: [String, Number], required: true },
})
const emit = defineEmits(['start', 'stop', 'delete', 'update-transcript'])

const { t, locale } = useI18n()

const recordSeconds = ref(0)
const preparing = ref(false)
const showKrokoDialog = ref(false)
const loadingMessage = ref('')
const krokoDialogDismissed = ref(false)
const error = ref('')
const audioElement = ref(null)
const liveTranscript = ref('')
let interval = null
let transcription = null

function startTicking() {
  recordSeconds.value = 0
  interval = setInterval(() => (recordSeconds.value += 1), 1000)
}
function stopTicking() {
  clearInterval(interval)
}
onBeforeUnmount(async () => {
  clearInterval(interval)
  await transcription?.cancel()
})

async function startRecording() {
  if (preparing.value) return
  error.value = ''
  liveTranscript.value = ''
  loadingMessage.value = ''
  krokoDialogDismissed.value = false
  showKrokoDialog.value = true
  preparing.value = true
  try {
    transcription = new KrokoLiveTranscription({
      language: locale.value,
      onTranscript: (transcript) => { liveTranscript.value = transcript },
      onLoading: (message) => {
        loadingMessage.value = message
        if (message && !krokoDialogDismissed.value) showKrokoDialog.value = true
      },
    })
    await transcription.start()
    emit('start')
    startTicking()
  } catch (reason) {
    await transcription?.cancel()
    transcription = null
    error.value = reason.message || t('error.body')
  } finally {
    preparing.value = false
    showKrokoDialog.value = false
  }
}

async function stopRecording() {
  if (!transcription) return
  try {
    const recording = await transcription.stop()
    if (recording) {
      emit('stop', {
        ...recording,
        transcript: recording.transcript || liveTranscript.value,
      })
    }
  } catch (reason) {
    await transcription?.cancel()
    emit('delete')
    error.value = reason.message || t('error.body')
  } finally {
    transcription = null
    stopTicking()
  }
}

async function handleTap() {
  if (props.status === 'idle') {
    await startRecording()
  } else if (props.status === 'recording') {
    await stopRecording()
  }
}

async function handleReRecord() {
  liveTranscript.value = ''
  emit('delete')
  await startRecording()
}

function handleDelete() {
  liveTranscript.value = ''
  emit('delete')
}

const isPlaying = ref(false)
async function togglePlay() {
  if (!audioElement.value) return
  if (audioElement.value.paused) await audioElement.value.play()
  else audioElement.value.pause()
}

const formattedTime = computed(() => {
  const m = Math.floor(recordSeconds.value / 60)
  const s = recordSeconds.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})
</script>

<template>
  <div class="flex flex-col items-center gap-4 rounded-xl2 bg-blush-soft px-6 py-8 text-center dark:bg-lagoon-light/40">
    <KrokoLoadingDialog
      v-if="showKrokoDialog"
      :message="loadingMessage"
      gif-src="../gato_borboleta_sf.gif"
      @close="krokoDialogDismissed = true; showKrokoDialog = false"
    />
    <p v-if="error" class="text-sm font-semibold text-error" role="alert">{{ error }}</p>
    <!-- Idle -->
    <template v-if="status === 'idle'">
      <button
        type="button"
        @click="handleTap"
        :disabled="preparing"
        class="grid h-24 w-24 place-items-center rounded-full bg-rosewood text-cream-soft shadow-soft transition active:scale-95"
        :aria-label="t('quiz.recorder.start')"
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
          <path d="M6 11a6 6 0 0 0 12 0M12 19v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
      <div>
        <p class="font-display font-semibold text-lagoon dark:text-cream-soft">{{ t('quiz.recorder.idleTitle') }}</p>
        <p class="text-sm text-lagoon/60 dark:text-cream-soft/60">{{ preparing ? t('quiz.recorder.preparingTranscription') : t('quiz.recorder.idleHint') }}</p>
      </div>
    </template>

    <!-- Recording -->
    <template v-else-if="status === 'recording'">
      <button
        type="button"
        @click="handleTap"
        class="relative grid h-24 w-24 place-items-center rounded-full bg-error text-cream-soft shadow-soft transition active:scale-95"
        :aria-label="t('quiz.recorder.stop')"
      >
        <span class="absolute inset-0 animate-ping rounded-full bg-error/40"></span>
        <svg class="relative" width="26" height="26" viewBox="0 0 24 24" fill="none">
          <rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" />
        </svg>
      </button>
      <div>
        <p class="font-display font-semibold text-error">{{ t('quiz.recorder.recordingTitle') }}</p>
        <p class="text-sm text-lagoon/60 dark:text-cream-soft/60">{{ t('quiz.recorder.recordingHint') }}</p>
        <p class="mt-1 font-mono text-lg text-lagoon dark:text-cream-soft">{{ formattedTime }}</p>
      </div>
      <div class="w-full max-w-xl rounded-lg bg-cream-soft/80 p-3 text-left dark:bg-lagoon-soft/60" aria-live="polite">
        <p class="text-xs font-semibold text-lagoon/70 dark:text-cream-soft/70">{{ t('quiz.recorder.liveTranscriptTitle') }}</p>
        <p class="mt-1 min-h-5 text-sm text-lagoon/65 dark:text-cream-soft/65">{{ liveTranscript || t('quiz.recorder.liveTranscriptHint') }}</p>
      </div>
    </template>

    <!-- Recorded -->
    <template v-else>
      <button
        type="button"
        @click="togglePlay"
        class="grid h-24 w-24 place-items-center rounded-full bg-sage text-cream-soft shadow-soft transition active:scale-95"
        :aria-label="isPlaying ? t('quiz.recorder.pause') : t('quiz.recorder.play')"
      >
        <svg v-if="!isPlaying" width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
        </svg>
        <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none">
          <rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor" />
          <rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor" />
        </svg>
      </button>
      <div>
        <p class="font-display font-semibold text-lagoon dark:text-cream-soft">{{ t('quiz.recorder.readyTitle') }}</p>
        <p class="text-sm text-lagoon/60 dark:text-cream-soft/60">{{ t('quiz.recorder.readyHint') }}</p>
      </div>
      <div class="w-full max-w-xl text-left">
        <label :for="`transcript-${questionId}`" class="text-xs font-semibold text-lagoon/70 dark:text-cream-soft/70">
          {{ t('quiz.recorder.editTranscriptTitle') }}
        </label>
        <textarea
          :id="`transcript-${questionId}`"
          :value="transcript"
          rows="4"
          spellcheck="true"
          class="mt-1 w-full resize-y rounded-lg border border-lagoon/15 bg-cream-soft p-3 text-sm text-lagoon outline-none transition focus:border-rosewood dark:border-cream-soft/20 dark:bg-lagoon-soft dark:text-cream-soft"
          @input="$emit('update-transcript', $event.target.value)"
        />
        <p class="mt-1 text-xs text-lagoon/55 dark:text-cream-soft/55">{{ t('quiz.recorder.editTranscriptHint') }}</p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          @click="handleReRecord"
          class="rounded-full bg-misty/40 px-4 py-2 text-sm font-semibold text-lagoon transition hover:bg-misty/60 dark:bg-cream-soft/10 dark:text-cream-soft"
        >
          {{ t('quiz.recorder.reRecord') }}
        </button>
        <button
          type="button"
          @click="handleDelete"
          class="rounded-full bg-error/10 px-4 py-2 text-sm font-semibold text-error transition hover:bg-error/20"
        >
          {{ t('quiz.recorder.delete') }}
        </button>
      </div>
      <audio
        v-if="audioUrl"
        ref="audioElement"
        :src="audioUrl"
        class="hidden"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @ended="isPlaying = false"
      />
    </template>
  </div>
</template>
