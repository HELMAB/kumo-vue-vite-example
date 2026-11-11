import { ref, watchEffect } from "vue";

const stored = (() => {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
})();

const isDark = ref(stored ? stored === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches);

watchEffect(() => {
  // Kumo tokens switch palettes on <html data-theme="…">
  document.documentElement.dataset.theme = isDark.value ? "dark" : "light";
  try {
    localStorage.setItem("theme", isDark.value ? "dark" : "light");
  } catch {}
});

export function useTheme() {
  return { isDark, toggle: () => (isDark.value = !isDark.value) };
}
