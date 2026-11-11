import { computed, ref } from "vue";
import { demoAccount } from "@/data/mock";

/**
 * Mock authentication. Swap `login()` for a call to your API
 * (e.g. POST /auth/login returning { user, token }) and keep the rest.
 *
 * "Remember me" keeps the session in localStorage (survives closing the
 * browser); otherwise sessionStorage (cleared when the tab closes).
 */
const KEY = "auth";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
}

function persist(session, remember) {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    if (session) (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session));
  } catch {}
}

const session = ref(load());

export class InvalidCredentialsError extends Error {}

async function login({ email, password, remember }) {
  await new Promise((r) => setTimeout(r, 700)); // pretend network latency

  if (email.trim().toLowerCase() !== demoAccount.email || password !== demoAccount.password) {
    throw new InvalidCredentialsError();
  }
  const next = {
    user: { name: demoAccount.name, email: demoAccount.email, role: demoAccount.role },
    token: `demo-${Date.now()}`,
  };
  persist(next, remember);
  session.value = next;
  return next.user;
}

function logout() {
  persist(null);
  session.value = null;
}

export function useAuth() {
  return {
    user: computed(() => session.value?.user ?? null),
    token: computed(() => session.value?.token ?? null),
    isAuthenticated: computed(() => Boolean(session.value)),
    login,
    logout,
  };
}
