<script setup>
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import MascotLogo from './MascotLogo.vue'
import ThemeToggle from './ThemeToggle.vue'
import LocaleSwitcher from './LocaleSwitcher.vue'

const { t } = useI18n()
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-lagoon/10 bg-cream-soft/90 backdrop-blur dark:border-cream-soft/10 dark:bg-lagoon-soft/90">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
      <RouterLink to="/" class="flex items-center gap-2.5">
        <MascotLogo :size="36" />
        <span class="font-display text-lg font-semibold text-lagoon dark:text-cream-soft">{{ t('app.name') }}</span>
      </RouterLink>

      <nav class="hidden items-center gap-1 sm:flex">
        <RouterLink
          to="/"
          class="rounded-full px-4 py-2 text-sm font-semibold text-lagoon/80 transition hover:bg-lagoon/5 dark:text-cream-soft/80 dark:hover:bg-cream-soft/10"
          active-class="!bg-blush/60 !text-lagoon dark:!bg-rosewood/30 dark:!text-cream-soft"
        >
          {{ t('nav.home') }}
        </RouterLink>
        <span
          class="cursor-not-allowed rounded-full px-4 py-2 text-sm font-semibold text-lagoon/30 dark:text-cream-soft/30"
          :title="t('nav.soon')"
        >
          {{ t('nav.profile') }}
        </span>
        <span
          class="cursor-not-allowed rounded-full px-4 py-2 text-sm font-semibold text-lagoon/30 dark:text-cream-soft/30"
          :title="t('nav.soon')"
        >
          {{ t('nav.history') }}
        </span>
      </nav>

      <div class="flex items-center gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
