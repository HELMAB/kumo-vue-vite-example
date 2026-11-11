import { createRouter, createWebHistory } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { applySeo } from "@/seo";
import { useAuth } from "@/composables/useAuth";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    meta: { title: "auth.title", guestOnly: true },
  },
  {
    path: "/",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "dashboard", component: () => import("@/views/DashboardView.vue"), meta: { title: "nav.dashboard" } },
      { path: "students", name: "students", component: () => import("@/views/StudentsView.vue"), meta: { title: "nav.students" } },
      { path: "teachers", name: "teachers", component: () => import("@/views/TeachersView.vue"), meta: { title: "nav.teachers" } },
      { path: "classes", name: "classes", component: () => import("@/views/ClassesView.vue"), meta: { title: "nav.classes" } },
      { path: "attendance", name: "attendance", component: () => import("@/views/AttendanceView.vue"), meta: { title: "nav.attendance" } },
      { path: "fees", name: "fees", component: () => import("@/views/FeesView.vue"), meta: { title: "nav.fees" } },
      { path: "settings", name: "settings", component: () => import("@/views/SettingsView.vue"), meta: { title: "nav.settings" } },
      { path: ":pathMatch(.*)*", name: "not-found", component: () => import("@/views/NotFoundView.vue"), meta: { title: "nav.notFound" } },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Auth guard: signed-out users go to /login (and come back afterwards);
// signed-in users skip the login page.
router.beforeEach((to) => {
  const { isAuthenticated } = useAuth();
  if (to.matched.some((r) => r.meta.requiresAuth) && !isAuthenticated.value) {
    return { name: "login", query: to.fullPath === "/" ? {} : { redirect: to.fullPath } };
  }
  if (to.meta.guestOnly && isAuthenticated.value) return { path: "/" };
});

// Title, description and social tags per page (meta.title is an i18n key).
// The layout re-applies this when the language changes.
router.afterEach(applySeo);

export default router;
