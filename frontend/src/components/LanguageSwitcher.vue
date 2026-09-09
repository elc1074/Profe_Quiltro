<script setup>
import { computed } from 'vue'
import I18nManager from '@/i18n/manager'
const languages = [{ code: 'es', label: 'ES' }, { code: 'pt', label: 'PT' }, { code: 'en', label: 'EN' }]
const currentLocale = computed(() => I18nManager.currentLocale)
</script>
<template><div class="language-switcher" aria-label="Language selector"><button v-for="language in languages" :key="language.code" type="button" :class="{ active: currentLocale === language.code }" @click="I18nManager.setLocale(language.code)">{{ language.label }}</button></div></template>
<style scoped>
.language-switcher { display: flex; padding: 3px; border: 1px solid #CFE2D5; border-radius: 999px; background: #fff; }.language-switcher button { border: 0; border-radius: 999px; padding: .27rem .42rem; background: transparent; color: #52705D; font-size: .7rem; font-weight: 800; cursor: pointer; }.language-switcher button.active { background: #E7F3EA; color: #1F5B45; }.dark .language-switcher { border-color: #356447; background: #18382B; }.dark .language-switcher button { color: #B8D4C1; }.dark .language-switcher button.active { color: #EAF3EC; background: #29503B; }
</style>
