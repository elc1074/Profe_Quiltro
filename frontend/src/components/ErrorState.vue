<script setup>
import { useI18n } from 'vue-i18n'
import BaseButton from './BaseButton.vue'

defineProps({
  title: { type: String, default: '' },
  body: { type: String, default: '' },
})
defineEmits(['retry'])

const { t } = useI18n()
</script>

<template>
  <div class="mx-auto flex max-w-sm flex-col items-center gap-4 rounded-xl2 bg-error-bg px-6 py-10 text-center dark:bg-error-bgDark">
    <div class="grid h-16 w-16 place-items-center rounded-full bg-error/15">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M12 8v5" stroke="#B4525A" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="12" cy="16.2" r="1.1" fill="#B4525A" />
        <circle cx="12" cy="12" r="9.5" stroke="#B4525A" stroke-width="2" />
      </svg>
    </div>
    <h3 class="font-display text-lg font-semibold text-lagoon dark:text-cream-soft">{{ title || t('error.title') }}</h3>
    <p class="text-sm text-lagoon/70 dark:text-cream-soft/70">{{ body || t('error.body') }}</p>
    <BaseButton variant="primary" @click="$emit('retry')">{{ t('error.retry') }}</BaseButton>
  </div>
</template>
