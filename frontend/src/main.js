import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from "./i18n"; 
import I18nManager from "./i18n/manager";

import { useThemeStore } from './stores/theme'

import {inject } from '@vercel/analytics'

const app = createApp(App);
I18nManager.init(i18n);

app
    .use(createPinia())
    .use(router)
    .use(i18n); 

inject()

app.mount('#app')

const themeStore = useThemeStore()
themeStore.applyToDom()
themeStore.initSystemListener()
document.documentElement.setAttribute('lang', i18n.global.locale.value)

