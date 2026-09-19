<script setup>
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-cream-soft dark:bg-lagoon-soft">
    <NavBar />
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>
