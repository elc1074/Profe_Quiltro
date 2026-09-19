import { defineStore } from 'pinia'

const STORAGE_KEY = 'profe-michi-theme'

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: localStorage.getItem(STORAGE_KEY) || 'system',
    systemDark: systemPrefersDark(),
  }),
  getters: {
    isDark(state) {
      if (state.mode === 'dark') return true
      if (state.mode === 'light') return false
      return state.systemDark
    },
  },
  actions: {
    applyToDom() {
      document.documentElement.classList.toggle('dark', this.isDark)
    },
    setMode(mode) {
      this.mode = mode
      if (mode === 'system') {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, mode)
      }
      this.applyToDom()
    },
    toggle() {
      this.setMode(this.isDark ? 'light' : 'dark')
    },
    initSystemListener() {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = (e) => {
        this.systemDark = e.matches
        if (this.mode === 'system') this.applyToDom()
      }
      mq.addEventListener ? mq.addEventListener('change', listener) : mq.addListener(listener)
    },
  },
})
