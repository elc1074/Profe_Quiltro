<script setup>
import { useThemeStore } from '../stores/theme'
import { useI18n } from 'vue-i18n'

const theme = useThemeStore()
const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    @click="theme.toggle()"
    class="grid h-10 w-10 place-items-center rounded-full bg-misty/30 text-lagoon transition hover:bg-misty/50 dark:bg-cream-soft/10 dark:text-cream-soft dark:hover:bg-cream-soft/20"
    :aria-label="t('nav.theme')"
    :title="t('nav.theme')"
  >
    <svg v-if="theme.isDark" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="2" />
    </svg>
    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
    </svg>
  </button>
</template>
