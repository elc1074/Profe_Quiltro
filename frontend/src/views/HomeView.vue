<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import MascotFull from '../components/MascotFull.vue'

const { t } = useI18n()
const router = useRouter()

const steps = [
  { title: 'step1Title', body: 'step1Body', icon: 'upload' },
  { title: 'step2Title', body: 'step2Body', icon: 'mic' },
  { title: 'step3Title', body: 'step3Body', icon: 'heart' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-10">
    <section class="grid items-center gap-10 sm:grid-cols-2">
      <div>
        <h1 class="max-w-md text-3xl font-semibold leading-tight text-lagoon dark:text-cream-soft sm:text-4xl">
          {{ t('home.title') }}
        </h1>
        <p class="mt-4 max-w-md text-base text-lagoon/70 dark:text-cream-soft/70">
          {{ t('home.subtitle') }}
        </p>
        <BaseButton size="lg" class="mt-8" @click="router.push('/enviar')">
          {{ t('home.cta') }}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </BaseButton>
      </div>
      <div class="flex justify-center rounded-blob bg-blush-soft py-10 dark:bg-lagoon-light/40">
        <!--<MascotFull :size="220" />-->
        <picture>
          <img class="mascote_maior max-h-[240px]" src="../../mascote_maior.webp" alt="Descrição da imagem">
        </picture>

      </div>
    </section>

    <section class="mt-16">
      <h2 class="font-display text-xl font-semibold text-lagoon dark:text-cream-soft">{{ t('home.stepsTitle') }}</h2>
      <div class="mt-5 grid gap-4 sm:grid-cols-3">
        <div
          v-for="step in steps"
          :key="step.title"
          class="rounded-xl2 bg-cream p-5 shadow-soft dark:bg-lagoon-light/50 dark:shadow-softDark"
        >
          <div class="mb-3 grid h-11 w-11 place-items-center rounded-full bg-sage/20 text-sage-dark dark:bg-sage/25 dark:text-sage-light">
            <svg v-if="step.icon === 'upload'" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <svg v-else-if="step.icon === 'mic'" width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" stroke-width="2" /><path d="M6 11a6 6 0 0 0 12 0M12 19v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 20.5s-7.5-4.6-9.7-9.2C.7 7.8 2.4 4.6 5.6 4c2-.4 3.8.5 5 2.1a5.4 5.4 0 0 1 5-2.1c3.2.6 4.9 3.8 3.3 7.3-2.2 4.6-9.7 9.2-9.7 9.2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
          </div>
          <h3 class="font-display font-semibold text-lagoon dark:text-cream-soft">{{ t(`home.${step.title}`) }}</h3>
          <p class="mt-1 text-sm text-lagoon/65 dark:text-cream-soft/65">{{ t(`home.${step.body}`) }}</p>
        </div>
      </div>
    </section>

    <section class="mt-10 rounded-xl2 border border-dashed border-lagoon/20 p-5 dark:border-cream-soft/20">
      <p class="font-display text-sm font-semibold text-lagoon/70 dark:text-cream-soft/70">{{ t('home.futureTitle') }}</p>
      <p class="mt-1 text-sm text-lagoon/55 dark:text-cream-soft/55">{{ t('home.futureBody') }}</p>
    </section>
  </div>
</template>