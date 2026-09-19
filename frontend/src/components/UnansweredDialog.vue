<script setup>
import { useI18n } from 'vue-i18n'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  count: { type: Number, required: true },
})
defineEmits(['review', 'submit-anyway'])

const { t } = useI18n()
</script>

<template>
  <div class="fixed inset-0 z-30 flex items-end justify-center bg-lagoon/40 p-4 backdrop-blur-sm sm:items-center dark:bg-black/60" role="dialog" aria-modal="true">
    <div class="w-full max-w-sm rounded-xl2 bg-cream-soft p-6 shadow-soft dark:bg-lagoon-light">
      <div class="mb-3 grid h-12 w-12 place-items-center rounded-full bg-warning-bg text-warning dark:bg-warning-bgDark">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v4.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="12" cy="16.5" r="1" fill="currentColor" />
          <path d="M10.3 3.9 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        </svg>
      </div>
      <h3 class="font-display text-lg font-semibold text-lagoon dark:text-cream-soft">{{ t('quiz.unansweredDialog.title') }}</h3>
      <p class="mt-1 text-sm text-lagoon/70 dark:text-cream-soft/70">
        {{ count === 1 ? t('quiz.unansweredDialog.bodyOne') : t('quiz.unansweredDialog.bodyMany', { count }) }}
      </p>
      <div class="mt-6 flex flex-col gap-2">
        <BaseButton variant="primary" @click="$emit('review')">{{ t('quiz.unansweredDialog.review') }}</BaseButton>
        <BaseButton variant="ghost" @click="$emit('submit-anyway')">{{ t('quiz.unansweredDialog.submitAnyway') }}</BaseButton>
      </div>
    </div>
  </div>
</template>
