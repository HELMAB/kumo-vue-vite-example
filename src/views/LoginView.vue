<script setup>
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Mail, Lock, Eye, EyeOff, LogIn, Languages, Moon, Sun, CheckCircle2, KeyRound } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/banner";
import { Checkbox } from "@/components/ui/checkbox";
import { Dropdown } from "@/components/ui/dropdown";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { LayerCard, LayerCardPrimary, LayerCardSecondary } from "@/components/ui/layer-card";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import { useAuth, InvalidCredentialsError } from "@/composables/useAuth";
import { useTheme } from "@/composables/useTheme";
import { demoAccount } from "@/data/mock";
import { LOCALES } from "@/i18n";

const { t, tm, rt, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const { login } = useAuth();
const { isDark, toggle: toggleTheme } = useTheme();

const form = reactive({ email: "", password: "", remember: true });
const errors = reactive({ email: "", password: "" });
const failed = ref(false);
const submitting = ref(false);
const showPassword = ref(false);

const currentLocale = computed(() => LOCALES.find((l) => l.value === locale.value));
const languageMenu = computed(() => LOCALES.map((l) => ({ label: l.label, value: l.value, selected: l.value === locale.value })));
const points = computed(() => tm("auth.brandPoints").map((p) => rt(p)));
const year = new Date().getFullYear();

function validate() {
  const email = form.email.trim();
  errors.email = !email ? t("auth.emailRequired") : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : t("auth.emailInvalid");
  errors.password = form.password ? "" : t("auth.passwordRequired");
  return !errors.email && !errors.password;
}

/** Only follow same-app paths, never an absolute or protocol-relative URL. */
function safeRedirect(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

async function submit() {
  failed.value = false;
  if (!validate()) return;
  submitting.value = true;
  try {
    const user = await login(form);
    toast.add({ title: t("auth.signedIn"), description: t("auth.signedInDesc", { name: user.name }), variant: "success" });
    router.replace(safeRedirect(route.query.redirect));
  } catch (err) {
    if (!(err instanceof InvalidCredentialsError)) throw err;
    failed.value = true;
    form.password = "";
  } finally {
    submitting.value = false;
  }
}

function useDemo() {
  form.email = demoAccount.email;
  form.password = demoAccount.password;
  errors.email = errors.password = "";
  failed.value = false;
}
</script>

<template>
  <div class="login">
    <!-- Brand panel (hidden on small screens) -->
    <aside class="login__brand" aria-hidden="true">
      <div class="brand-panel">
        <img src="/favicon.svg" alt="" width="72" height="72" class="brand-panel__logo" />
        <h2 class="brand-panel__name">{{ t("app.name") }}</h2>
        <p class="brand-panel__tagline">{{ t("auth.brandTagline") }}</p>
        <ul class="brand-panel__points">
          <li v-for="p in points" :key="p"><CheckCircle2 :size="18" /> {{ p }}</li>
        </ul>
      </div>
      <p class="brand-panel__copy">{{ t("auth.copyright", { year }) }}</p>
    </aside>

    <!-- Form -->
    <main class="login__main">
      <div class="login__tools">
        <Dropdown :items="languageMenu" align="end" @select="(e) => (locale = e.value)">
          <template #trigger>
            <Button variant="ghost" size="sm" :aria-label="t('topbar.language')">
              <template #icon><Languages /></template>
              {{ currentLocale?.short }}
            </Button>
          </template>
        </Dropdown>
        <Button variant="ghost" shape="square" size="sm" :title="isDark ? t('topbar.lightMode') : t('topbar.darkMode')" @click="toggleTheme">
          <template #icon><Sun v-if="isDark" /><Moon v-else /></template>
        </Button>
      </div>

      <div class="login__panel">
        <div class="login__heading">
          <img src="/favicon.svg" alt="" width="44" height="44" class="login__logo" />
          <Text variant="heading" size="lg" as="h1" class="login__title">{{ t("auth.welcome") }}</Text>
          <Text variant="secondary">{{ t("auth.subtitle") }}</Text>
        </div>

        <Banner v-if="failed" variant="error" :title="t('auth.invalidTitle')" :description="t('auth.invalid')" live />

        <form class="login__form" novalidate @submit.prevent="submit">
          <InputGroup :label="t('auth.email')" :error="errors.email" size="lg">
            <InputGroupAddon><Mail /></InputGroupAddon>
            <InputGroupInput
              v-model="form.email"
              type="email"
              name="email"
              autocomplete="username"
              inputmode="email"
              :placeholder="t('auth.emailPlaceholder')"
              autofocus
            />
          </InputGroup>

          <InputGroup :label="t('auth.password')" :error="errors.password" size="lg">
            <InputGroupAddon><Lock /></InputGroupAddon>
            <InputGroupInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              :placeholder="t('auth.passwordPlaceholder')"
            />
            <InputGroupAddon align="end">
              <InputGroupButton
                shape="square"
                :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" /><Eye v-else />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <div class="login__row">
            <Checkbox v-model="form.remember" :label="t('auth.remember')" />
            <a href="#" class="login__link" @click.prevent="toast.add({ title: t('auth.forgot'), description: t('auth.forgotTodo'), variant: 'info' })">
              {{ t("auth.forgot") }}
            </a>
          </div>

          <Button type="submit" variant="primary" size="lg" class="login__submit" :loading="submitting">
            <template #icon><LogIn /></template>
            {{ t("auth.submit") }}
          </Button>
        </form>

        <!-- Demo credentials: remove with the mock auth -->
        <LayerCard class="login__demo">
          <LayerCardSecondary class="layer-head">
            <span class="login__demo-title"><KeyRound :size="16" /> {{ t("auth.demoTitle") }}</span>
            <Button size="sm" @click="useDemo">{{ t("auth.demoUse") }}</Button>
          </LayerCardSecondary>
          <LayerCardPrimary>
            <dl class="login__creds">
              <dt>{{ t("auth.email") }}</dt>
              <dd>{{ demoAccount.email }}</dd>
              <dt>{{ t("auth.password") }}</dt>
              <dd>{{ demoAccount.password }}</dd>
            </dl>
          </LayerCardPrimary>
        </LayerCard>
      </div>
    </main>
  </div>
</template>

<style scoped>
.login {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  min-block-size: 100svh;
  background: var(--kv-surface-base);
}

/* ---- brand panel ---- */
.login__brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--kv-space-12);
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(circle at 20% 85%, rgb(255 180 60 / 0.35), transparent 45%),
    linear-gradient(145deg, #0b2a66, #024dd6);
}
.login__brand::after {
  /* a soft rising sun on the horizon */
  content: "";
  position: absolute;
  inset-inline-start: -10%;
  inset-block-end: -38%;
  inline-size: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 210 90 / 0.4), transparent 65%);
  pointer-events: none;
}
.brand-panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--kv-space-4);
  max-inline-size: 30rem;
  margin-block: auto;
}
.brand-panel__logo {
  border-radius: 18px;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.25);
}
.brand-panel__name {
  margin: var(--kv-space-4) 0 0;
  font-size: var(--kv-text-3xl);
  font-weight: 700;
  line-height: 1.4;
}
.brand-panel__tagline {
  margin: 0;
  font-size: var(--kv-text-lg);
  color: #cfe0ff;
}
.brand-panel__points {
  display: flex;
  flex-direction: column;
  gap: var(--kv-space-3);
  margin: var(--kv-space-4) 0 0;
  padding: 0;
  list-style: none;
}
.brand-panel__points li {
  display: flex;
  align-items: center;
  gap: var(--kv-space-2);
  color: #e6efff;
}
.brand-panel__points svg {
  color: #ffd25a;
  flex-shrink: 0;
}
.brand-panel__copy {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: var(--kv-text-sm);
  color: #9fbfff;
}

/* ---- form side ---- */
.login__main {
  position: relative;
  display: grid;
  place-items: center;
  padding: var(--kv-space-16) var(--kv-space-6);
}
.login__tools {
  position: absolute;
  inset-block-start: var(--kv-space-4);
  inset-inline-end: var(--kv-space-4);
  display: flex;
  gap: var(--kv-space-1);
}
.login__panel {
  display: flex;
  flex-direction: column;
  gap: var(--kv-space-6);
  inline-size: 100%;
  max-inline-size: 26rem;
}
.login__heading {
  display: flex;
  flex-direction: column;
  gap: var(--kv-space-1);
}
.login__logo {
  display: none;
  margin-block-end: var(--kv-space-3);
  border-radius: 10px;
}
.login__title {
  margin: 0;
  font-size: var(--kv-text-2xl) !important;
}
.login__form {
  display: flex;
  flex-direction: column;
  gap: var(--kv-space-4);
}
.login__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--kv-space-3);
}
.login__link {
  font-size: var(--kv-text-sm);
  color: var(--kv-text-link, var(--kv-text-brand));
  text-decoration: none;
}
.login__link:hover {
  text-decoration: underline;
}
.login__submit {
  inline-size: 100%;
  justify-content: center;
}
.login__demo {
  block-size: auto;
}
.login__demo-title {
  display: inline-flex;
  align-items: center;
  gap: var(--kv-space-1-5);
}
.login__creds {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--kv-space-1) var(--kv-space-4);
  margin: 0;
  font-size: var(--kv-text-sm);
}
.login__creds dt {
  color: var(--kv-text-subtle);
}
.login__creds dd {
  margin: 0;
  font-family: var(--kv-font-mono);
  color: var(--kv-text-strong);
}

@media (max-width: 900px) {
  .login {
    grid-template-columns: 1fr;
  }
  .login__brand {
    display: none;
  }
  .login__logo {
    display: block;
  }
}
</style>
