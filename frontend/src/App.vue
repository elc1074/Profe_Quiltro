<script setup>
import NavBar from './components/NavBar.vue'
import {Analytics} from '@vercel/analytics/vue'
</script>

<template>
  <Analytics debug="true"/>

  <div class="flex min-h-screen flex-col bg-cream-soft dark:bg-lagoon-soft">
    <NavBar />
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>
