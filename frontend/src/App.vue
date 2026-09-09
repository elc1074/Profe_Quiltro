<script setup>
import { onMounted, ref, watch } from 'vue'
import Nav from '@/components/Nav.vue'
const darkMode = ref(false)
onMounted(() => { darkMode.value = localStorage.getItem('bosque-theme') === 'dark' || (!localStorage.getItem('bosque-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches) })
watch(darkMode, (value) => { document.documentElement.classList.toggle('dark', value); localStorage.setItem('bosque-theme', value ? 'dark' : 'light') }, { immediate: true })
</script>
<template><Nav :dark-mode="darkMode" @toggle-theme="darkMode = !darkMode" /><RouterView /></template>
