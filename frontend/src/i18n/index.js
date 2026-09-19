import { createI18n } from "vue-i18n";

import I18nManager from "./manager";

const localeModules = import.meta.glob("./locales/*.json", { eager: true });

const messages = {};

for (const path in localeModules) {
  const match = path.match(/\.\/locales\/([^/]+)\.json$/);

  if (match) {
    messages[match[1]] = localeModules[path].default;
  }
}

export const SUPPORTED = Object.keys(messages);

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: I18nManager.guessDefaultLocale(),
  fallbackLocale: I18nManager.defaultLocale,
  messages,
});

I18nManager.init(i18n);

export async function setLocale(locale) {
  if (!SUPPORTED.includes(locale)) return;

  await I18nManager.setLocale(locale);
}

export default i18n;