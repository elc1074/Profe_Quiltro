<script setup>
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import i18n from './i18n'
import { precacheLiveTranscriptionModel } from './services/krokoLiveTranscription'

onMounted(() => {
  // Cache the sizeable model early, but defer worker creation until a quiz is requested.
  void precacheLiveTranscriptionModel(i18n.global.locale.value).catch(() => {})
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
