<script setup>
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import i18n from './i18n'
import { preloadLiveTranscription } from './services/krokoLiveTranscription'

onMounted(() => {
  // Start the complete recognizer as soon as the UI is available. Every later
  // preload call shares this same promise, so the worker is created only once.
  void preloadLiveTranscription(i18n.global.locale.value).catch(() => {})
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-cream-soft dark:bg-lagoon-soft">
    <NavBar />
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>
