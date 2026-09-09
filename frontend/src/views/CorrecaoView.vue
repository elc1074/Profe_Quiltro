<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import I18nManager from '@/i18n/manager'
const { t } = useI18n(); const router = useRouter(); const dots = ref(0); let interval
onMounted(() => { interval = setInterval(() => dots.value = (dots.value + 1) % 4, 350); setTimeout(() => { clearInterval(interval); router.push(I18nManager.i18nRoute({ name: 'resultado' })) }, 2700) }); onUnmounted(() => clearInterval(interval))
</script>
<template><main class="correction"><section><div class="orbit"><span>✦</span></div><p class="eyebrow">{{ t('correction.eyebrow') }}</p><h1>{{ t('correction.title') }}{{ '.'.repeat(dots) }}</h1><p>{{ t('correction.description') }}</p><div class="leaves" aria-hidden="true">●　●　●</div></section></main></template>
<style>.correction { min-height: calc(100vh - 76px); display: grid; place-items: center; padding: 2rem; text-align: center; }.correction section { max-width: 460px; }.orbit { width: 125px; height: 125px; margin: 0 auto 1.8rem; display: grid; place-items: center; border: 2px solid #A8C7B4; border-radius: 50%; color: #fff; background: #1F5B45; font-size: 2.5rem; animation: orbit 2s linear infinite; }.eyebrow { color: #347158; font-size: .75rem; font-weight: 800; letter-spacing: .1em; }.correction h1 { margin: .65rem 0 .9rem; color: #1F5B45; font: 700 2.3rem Lora,serif; }.correction p:not(.eyebrow) { color: #52705D; line-height: 1.6; }.leaves { margin-top: 2rem; color: #A8C7B4; letter-spacing: .4rem; }.dark .correction h1 { color: #BEE0C9; }.dark .correction p:not(.eyebrow) { color: #B8D4C1; }@keyframes orbit { to { transform: rotate(360deg); } }</style>
