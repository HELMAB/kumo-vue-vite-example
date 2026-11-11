import { useI18n } from "vue-i18n";
import { formatDate, formatMoney } from "@/i18n";

/**
 * Turns the language-neutral values stored in data (keys, codes, numbers)
 * into text for the active locale. Use it in any view that shows data.
 */
export function useLabels() {
  const { t, locale } = useI18n();
  const KM_SECTION = { A: "ក", B: "ខ" };

  const section = (s) => (locale.value === "km" ? (KM_SECTION[s] ?? s) : s);
  /** "1A" → "1ក" in Khmer */
  const cls = (code) => code.replace(/[AB]$/, (s) => section(s));

  return {
    t,
    locale,
    section,
    cls,
    classLabel: (code) => t("classCode", { code: cls(code) }),
    grade: (n) => t("grade", { n }),
    term: (n) => t("term", { n }),
    status: (key) => t(`status.${key}`),
    gender: (key) => t(`gender.${key}`),
    subject: (key) => t(`subject.${key}`),
    teacher: (name) => name ?? t("classes.unassigned"),
    money: (n) => formatMoney(n),
    date: (iso, opts) => formatDate(iso, opts),
  };
}
