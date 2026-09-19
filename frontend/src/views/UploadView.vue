<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import BaseButton from '../components/BaseButton.vue'

const { t } = useI18n()
const router = useRouter()
const quiz = useQuizStore()

const isDragging = ref(false)
const errorMsg = ref('')
const inputRef = ref(null)

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function acceptFile(file) {
  if (!file) return
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    errorMsg.value = t('upload.invalidType')
    return
  }
  errorMsg.value = ''
  quiz.setFile({ name: file.name, size: file.size })
}

function onDrop(e) {
  isDragging.value = false
  acceptFile(e.dataTransfer.files[0])
}
function onInputChange(e) {
  acceptFile(e.target.files[0])
}
function openPicker() {
  inputRef.value?.click()
}

const cta = computed(() => quiz.hasFile)

function goGenerate() {
  if (!quiz.hasFile) return
  router.push('/gerando')
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
    <h1 class="text-2xl font-semibold text-lagoon dark:text-cream-soft sm:text-3xl">{{ t('upload.title') }}</h1>
    <p class="mt-2 text-lagoon/65 dark:text-cream-soft/65">{{ t('upload.subtitle') }}</p>

    <div
      class="mt-8 rounded-blob border-2 border-dashed p-10 text-center transition-colors"
      :class="isDragging ? 'border-rosewood bg-blush-soft' : 'border-misty/60 bg-cream dark:bg-lagoon-light/30'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <template v-if="!quiz.hasFile">
        <div class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-misty/25 text-misty-dark dark:bg-misty-dark/30 dark:text-misty-light">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </div>
        <p class="font-display font-semibold text-lagoon dark:text-cream-soft">{{ t('upload.dropTitle') }}</p>
        <p class="mt-1 text-sm text-lagoon/55 dark:text-cream-soft/55">{{ t('upload.dropSubtitle') }}</p>
        <BaseButton variant="secondary" class="mt-5" @click="openPicker">{{ t('upload.browse') }}</BaseButton>
        <input ref="inputRef" type="file" accept="application/pdf,.pdf" class="hidden" @change="onInputChange" />
      </template>

      <template v-else>
        <div class="mx-auto flex max-w-sm items-center gap-3 rounded-xl2 bg-cream-soft p-4 text-left shadow-soft dark:bg-lagoon-light">
          <div class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-rosewood/10 text-rosewood dark:bg-rosewood/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" /><path d="M14 3v5h5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" /></svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-lagoon dark:text-cream-soft">{{ quiz.file.name }}</p>
            <p class="text-xs text-lagoon/55 dark:text-cream-soft/55">{{ t('upload.fileReady') }} · {{ formatSize(quiz.file.size) }}</p>
          </div>
        </div>
        <div class="mt-4 flex justify-center gap-2">
          <BaseButton variant="ghost" @click="quiz.removeFile()">{{ t('upload.remove') }}</BaseButton>
          <BaseButton variant="secondary" @click="openPicker">{{ t('upload.replace') }}</BaseButton>
          <input ref="inputRef" type="file" accept="application/pdf,.pdf" class="hidden" @change="onInputChange" />
        </div>
      </template>
    </div>

    <p v-if="errorMsg" class="mt-3 text-sm font-semibold text-error">{{ errorMsg }}</p>

    <div class="mt-8 rounded-xl2 bg-cream p-5 dark:bg-lagoon-light/40">
      <div class="flex items-center justify-between">
        <span class="font-semibold text-lagoon dark:text-cream-soft">{{ t('upload.questionCountLabel') }}</span>
        <div class="flex gap-2">
          <span
            v-for="n in quiz.availableCounts"
            :key="n"
            class="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold"
            :class="n === quiz.questionCount
              ? 'bg-rosewood text-cream-soft'
              : 'cursor-not-allowed bg-lagoon/10 text-lagoon/30 dark:bg-cream-soft/10 dark:text-cream-soft/30'"
          >{{ n }}</span>
        </div>
      </div>
      <p class="mt-2 text-sm text-lagoon/55 dark:text-cream-soft/55">{{ t('upload.questionCountNote') }}</p>
    </div>

    <div class="mt-8 flex flex-col items-center gap-2">
      <BaseButton size="lg" :disabled="!cta" @click="goGenerate">{{ t('upload.cta') }}</BaseButton>
      <p v-if="!cta" class="text-xs text-lagoon/50 dark:text-cream-soft/50">{{ t('upload.noFileHint') }}</p>
    </div>
  </div>
</template>
