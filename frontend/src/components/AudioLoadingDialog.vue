<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  message: { type: String, default: '' },
  gifSrc: { type: String, default: '' },
})

const emit = defineEmits(['close'])
const { t } = useI18n()
</script>

<template>
  <div class="fixed inset-0 z-50 grid place-items-center bg-lagoon/45 px-4 py-6 backdrop-blur-sm dark:bg-black/60">
    <section
      class="relative w-full max-w-md rounded-xl2 bg-cream-soft p-6 text-center shadow-soft dark:bg-lagoon-soft dark:shadow-softDark"
      role="dialog"
      aria-modal="true"
      :aria-label="t('quiz.krokoLoading.title')"
    >
      <button
        type="button"
        class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-xl text-lagoon/60 transition hover:bg-lagoon/10 hover:text-lagoon dark:text-cream-soft/60 dark:hover:bg-cream-soft/10 dark:hover:text-cream-soft"
        :aria-label="t('quiz.krokoLoading.close')"
        @click="emit('close')"
      >
        <span aria-hidden="true">&times;</span>
      </button>

      <div class="mx-auto mb-5 grid min-h-50 w-full max-w-80 place-items-center rounded-xl bg-blush-soft p-3 dark:bg-lagoon-light/40">
        <img
          v-if="props.gifSrc"
          :src="props.gifSrc"
          :alt="t('quiz.krokoLoading.gifAlt')"
          class="max-h-100 max-w-full object-contain"
        >
        <span v-else class="text-xs text-lagoon/50 dark:text-cream-soft/50">{{ t('quiz.krokoLoading.gifPlaceholder') }}</span>
      </div>

      <h2 class="font-display text-xl font-semibold text-lagoon dark:text-cream-soft">
        {{ t('quiz.krokoLoading.title') }}
      </h2>
      <p class="mt-2 text-sm text-lagoon/65 dark:text-cream-soft/65">
        {{ t('quiz.krokoLoading.hint') }}
      </p>

      <label for="kroko-status" class="mt-5 block text-left text-xs font-semibold text-lagoon/70 dark:text-cream-soft/70">
        {{ t('quiz.krokoLoading.messageLabel') }}
      </label>
      <input
        id="kroko-status"
        :value="message || t('quiz.krokoLoading.defaultMessage')"
        readonly
        class="mt-1 w-full rounded-lg border border-lagoon/15 bg-white px-3 py-2 text-sm text-lagoon outline-none dark:border-cream-soft/20 dark:bg-lagoon-light dark:text-cream-soft"
      >
    </section>
  </div>
</template>
