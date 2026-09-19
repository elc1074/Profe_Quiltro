<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  status: { type: String, required: true }, // correct | incorrect | unanswered
})
const { t } = useI18n()

const styles = {
  correct: 'bg-success-bg text-success dark:bg-success-bgDark dark:text-sage-light',
  incorrect: 'bg-error-bg text-error dark:bg-error-bgDark dark:text-blush',
  unanswered: 'bg-warning-bg text-warning dark:bg-warning-bgDark dark:text-warning',
}
const icons = {
  correct: '✓',
  incorrect: '✕',
  unanswered: '–',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
    :class="styles[status]"
  >
    <span aria-hidden="true">{{ icons[status] }}</span>
    {{ t(`result.status.${status}`) }}
  </span>
</template>
