import { watch } from "vue";
import { createI18n } from "vue-i18n";
import km from "./km";
import en from "./en";

export const LOCALES = [
  { value: "km", label: "ខ្មែរ", short: "ខ្មែរ" },
  { value: "en", label: "English", short: "EN" },
];

const saved = (() => {
  try {
    return localStorage.getItem("locale");
  } catch {
    return null;
  }
})();

export const i18n = createI18n({
  legacy: false,
  locale: LOCALES.some((l) => l.value === saved) ? saved : "km", // Khmer is the primary language
  fallbackLocale: "en",
  messages: { km, en },
});

// Keep <html lang> in sync: drives Khmer typography rules and screen readers.
watch(
  i18n.global.locale,
  (locale) => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem("locale", locale);
    } catch {}
  },
  { immediate: true },
);

/** Format helpers that follow the active locale. */
export const intlLocale = () => (i18n.global.locale.value === "km" ? "km-KH" : "en-US");
// Cambodian apps usually write USD as "$1,980" in both languages; pinning the
// format keeps it identical whether or not the browser has Khmer locale data.
export const formatMoney = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
/*
 * Khmer dates are formatted by hand: some browsers (e.g. many Chromium builds
 * on Linux) ship without Khmer locale data, and Intl silently falls back to
 * English ("Nov 14"). Month names are short enough that there is no separate
 * abbreviated form in common use.
 */
const KM_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];

export const formatDate = (iso, opts = { day: "numeric", month: "short", year: "numeric" }) => {
  const d = new Date(`${iso}T00:00:00`);
  if (i18n.global.locale.value === "km") {
    return [opts.day && d.getDate(), opts.month && KM_MONTHS[d.getMonth()], opts.year && d.getFullYear()]
      .filter(Boolean)
      .join(" ");
  }
  return new Intl.DateTimeFormat(intlLocale(), opts).format(d);
};
