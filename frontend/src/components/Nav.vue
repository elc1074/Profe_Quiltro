<script setup>
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './LanguageSwitcher.vue'
defineProps({ darkMode: Boolean })
defineEmits(['toggle-theme'])
const { t } = useI18n()
</script>
<template>
  <header class="topbar">
    <RouterLink class="brand" :to="{ name: 'home' }"><span class="brand-mark" aria-hidden="true">✦</span><span>Profe Quiltro</span></RouterLink>
    <div class="topbar-actions"><LanguageSwitcher /><button class="theme-button" type="button" :aria-label="t('common.toggleTheme')" @click="$emit('toggle-theme')">{{ darkMode ? '☀' : '☾' }}</button></div>
  </header>
</template>
<style scoped>
.topbar { min-height: 76px; padding: 0 5vw; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #D8E7DC; background: rgba(250,248,241,.9); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 10; }
:global(.dark) .topbar { background: rgba(16,37,28,.9); border-color: #29503B; }.brand { display: flex; align-items: center; gap: .65rem; color: #1F5B45; font-family: Lora, Georgia, serif; font-size: clamp(1.1rem, 2vw, 1.35rem); font-weight: 700; }.dark .brand { color: #BEE0C9; }.brand-mark { display: grid; place-items: center; width: 34px; height: 34px; color: #fff; background: #1F5B45; border-radius: 50% 50% 50% 14%; transform: rotate(-16deg); font-family: sans-serif; }.topbar-actions { display: flex; align-items: center; gap: .75rem; }.theme-button { border: 1px solid #B9D5C2; background: #fff; color: #1F5B45; border-radius: 50%; width: 38px; height: 38px; cursor: pointer; font-size: 1.1rem; }.dark .theme-button { color: #EAF3EC; background: #18382B; border-color: #356447; }
</style>
