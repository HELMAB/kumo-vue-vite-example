import { reactive } from "vue";

/**
 * Mock data for the template. Replace with API calls (e.g. in a Pinia store).
 *
 * Values that appear in the UI as words (status, gender, subject, grade, term)
 * are stored as language-neutral keys and translated at render time with
 * vue-i18n — see src/i18n/{km,en}.js.
 */

// Khmer names, written in Khmer script, family name first.
const given = ["សុភា", "ដារា", "វិសាល", "មីណា", "រិទ្ធី", "ស្រីនាង", "បុប្ផា", "កុសល", "ពិសិដ្ឋ", "សុខា", "វណ្ណៈ", "ចន្ទ្រា", "សុវណ្ណ", "លក្ខិណា", "ពុទ្ធី", "ស្រីពៅ", "រតនា", "សំណាង", "ធីតា", "មករា"];
const family = ["ចាន់", "សុខ", "គឹម", "លឹម", "ហេង", "លី", "តាន់", "មាស", "ឈឹម", "អ៊ុក"];

export const grades = [1, 2, 3, 4, 5, 6];
export const sections = ["A", "B"]; // shown as ក / ខ in Khmer (see useLabels)

export const teachers = reactive([
  { id: 1, name: "អ្នកគ្រូ ស្រី មុំ", subject: "khmer", classes: ["1A", "1B"], phone: "012 345 678", email: "srey.mom@school.edu.kh", status: "working" },
  { id: 2, name: "លោកគ្រូ ចន ខាតឺ", subject: "english", classes: ["2A", "3A"], phone: "015 222 101", email: "j.carter@school.edu.kh", status: "working" },
  { id: 3, name: "អ្នកគ្រូ អ៊ុក លក្ខិណា", subject: "math", classes: ["4A", "4B"], phone: "093 111 908", email: "leakena@school.edu.kh", status: "working" },
  { id: 4, name: "លោកគ្រូ ពេជ្រ ដារា", subject: "science", classes: ["5A", "5B"], phone: "077 654 321", email: "dara.pich@school.edu.kh", status: "onLeave" },
  { id: 5, name: "អ្នកគ្រូ លី អាណា", subject: "art", classes: ["2B", "3B"], phone: "010 888 777", email: "anna.lee@school.edu.kh", status: "working" },
  { id: 6, name: "លោកគ្រូ កែវ សុវណ្ណ", subject: "pe", classes: ["6A", "6B"], phone: "016 909 090", email: "sovann@school.edu.kh", status: "working" },
]);

export const classes = grades.flatMap((grade, g) =>
  sections.map((section, s) => {
    const code = `${grade}${section}`;
    const teacher = teachers.find((t) => t.classes.includes(code));
    return {
      code,
      grade,
      section,
      room: 100 + g * 10 + s + 1,
      teacher: teacher?.name ?? null,
      capacity: 30,
      enrolled: 18 + ((g * 7 + s * 5) % 12),
    };
  }),
);

export const students = reactive(
  Array.from({ length: 48 }, (_, i) => {
    const cls = classes[i % classes.length];
    return {
      id: 1001 + i,
      name: `${family[(i * 3) % family.length]} ${given[i % given.length]}`,
      gender: i % 2 ? "female" : "male",
      class: cls.code,
      grade: cls.grade,
      guardian: `${["លោក", "លោកស្រី"][i % 2]} ${family[(i * 7) % family.length]} ${given[(i * 5 + 3) % given.length]}`,
      phone: `0${10 + (i % 80)} ${String(100 + i * 7).padStart(3, "0")} ${String(500 + i * 13).slice(-3)}`,
      status: i % 5 === 4 ? "inactive" : "active",
      fee: i % 4 === 0 ? "overdue" : i % 3 === 0 ? "pending" : "paid",
    };
  }),
);

export const fees = reactive(
  students.slice(0, 24).map((s, i) => ({
    invoice: `INV-2026-${String(301 + i)}`,
    student: s.name,
    class: s.class,
    term: 2,
    amount: 120 + (i % 3) * 30,
    due: `2026-11-${String(5 + (i % 20)).padStart(2, "0")}`,
    status: s.fee,
  })),
);

export const events = [
  { date: "2026-11-14", title: "ptMeeting", tag: "meeting", variant: "info" },
  { date: "2026-11-18", title: "scienceFair", tag: "event", variant: "success" },
  { date: "2026-11-21", title: "feeDeadline", tag: "finance", variant: "warning" },
  { date: "2026-11-28", title: "midterm", tag: "exam", variant: "error" },
];

const TITLES = /^(លោកគ្រូ|អ្នកគ្រូ|លោកស្រី|លោក|Mr\.|Mrs\.|Ms\.)\s*/;

/**
 * Avatar initials. Khmer has no capital letters and a syllable's first glyph
 * can need the marks after it, so for Khmer we show the first consonant
 * cluster of the given name (last word) rather than two initials.
 */
export const initials = (name) => {
  const words = name.replace(TITLES, "").trim().split(/\s+/);
  if (/[ក-៿]/.test(name)) {
    const last = words.at(-1);
    // consonant + optional coeng (្) + subscript consonant
    return last.match(/^[ក-ឳ](្[ក-ឳ])?/)?.[0] ?? last[0];
  }
  return words.map((p) => p[0]).slice(0, 2).join("").toUpperCase();
};

export const statusVariant = (status) =>
  ({ active: "success", working: "success", paid: "success", inactive: "neutral", pending: "warning", onLeave: "warning", overdue: "error" })[status] ?? "neutral";

/**
 * Demo login for the mock auth in src/composables/useAuth.js. Shown on the
 * login page with a "Use demo account" button. Remove once a real API is wired.
 */
export const demoAccount = {
  email: "admin@sunrise.edu.kh",
  password: "sunrise2026",
  name: "ចាន់ សុគន្ធា",
  role: "admin",
};
