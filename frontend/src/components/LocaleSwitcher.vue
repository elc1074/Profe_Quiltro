<!-- LanguageSwitcher.vue -->
<script setup>
import { computed } from "vue";
import I18nManager from "@/i18n/manager";
import FlagSpain from "@/components/flags/FlagSpain.vue";
import FlagBrazil from "@/components/flags/FlagBrazil.vue";

const languages = [
  { code: "es", label: "Español", component: FlagSpain },
  { code: "pt", label: "Português", component: FlagBrazil },
];

const currentLocale = computed(() => I18nManager.currentLocale);

const activeIndicatorClass = computed(() => {
  const index = languages.findIndex((item) => item.code === currentLocale.value);
  return index <= 0
    ? "ab-language-switcher__indicator--index-0"
    : "ab-language-switcher__indicator--index-1";
});

async function selectLocale(code) {
  await I18nManager.setLocale(code);
}
</script>

<template>
  <div class="ab-language-switcher" role="radiogroup" aria-label="Language selector">
    <button
      v-for="item in languages"
      :key="item.code"
      type="button"
      role="radio"
      :aria-checked="currentLocale === item.code"
      :aria-label="item.label"
      class="ab-language-switcher__option"
      @click="selectLocale(item.code)">
      <component
        :is="item.component"
        class="ab-language-switcher__flag"
        :class="{
          'ab-language-switcher__flag--active': currentLocale === item.code,
          'ab-language-switcher__flag--inactive': currentLocale !== item.code,
        }" />
    </button>
    <span class="ab-language-switcher__indicator" :class="activeIndicatorClass" />
  </div>
</template>

<style scoped>
.ab-language-switcher {
  display: flex;
  align-items: space-between;
  gap: 0.5rem;
  position: relative;
}

.ab-language-switcher__option {
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  line-height: 0; 
}

.ab-language-switcher__flag {
  display: block;
  width: 32px;
  height: auto;
  border-radius: 3px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.ab-language-switcher__option:hover .ab-language-switcher__flag {
  transform: scale(1.15);
}

.ab-language-switcher__flag--inactive {
  opacity: 0.5;
}

.ab-language-switcher__flag--active {
  opacity: 1;
}


.ab-language-switcher__option:focus-visible .ab-language-switcher__flag {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  border-radius: 3px;
}
</style>