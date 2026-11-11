<script setup>
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  LayoutDashboard, GraduationCap, Users, School, CalendarCheck, Wallet, Settings,
  Search, Bell, Moon, Sun, LogOut, User, Languages,
} from "lucide-vue-next";
import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuBadge, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "@/components/ui/toast";
import { useTheme } from "@/composables/useTheme";
import { LOCALES } from "@/i18n";
import { applySeo } from "@/seo";
import { useAuth } from "@/composables/useAuth";
import { initials } from "@/data/mock";

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const { isDark, toggle: toggleTheme } = useTheme();
const { user, logout } = useAuth();
const userInitials = computed(() => (user.value ? initials(user.value.name) : ""));

// Re-apply title, description and social tags when the language changes
watch(locale, () => applySeo(route));

const nav = computed(() => [
  {
    label: t("nav.overview"),
    items: [{ to: "/", label: t("nav.dashboard"), icon: LayoutDashboard }],
  },
  {
    label: t("nav.academics"),
    items: [
      { to: "/students", label: t("nav.students"), icon: GraduationCap },
      { to: "/teachers", label: t("nav.teachers"), icon: Users },
      { to: "/classes", label: t("nav.classes"), icon: School },
      { to: "/attendance", label: t("nav.attendance"), icon: CalendarCheck },
    ],
  },
  {
    label: t("nav.administration"),
    items: [
      { to: "/fees", label: t("nav.fees"), icon: Wallet, badge: t("nav.due", { n: 3 }) },
      { to: "/settings", label: t("nav.settings"), icon: Settings },
    ],
  },
]);

const isActive = (to) => (to === "/" ? route.path === "/" : route.path.startsWith(to));

const crumbs = computed(() =>
  route.path === "/"
    ? [{ label: t("nav.dashboard") }]
    : [{ label: t("nav.home"), href: "/" }, { label: t(route.meta.title ?? "nav.notFound") }],
);

// ---- language ----
const currentLocale = computed(() => LOCALES.find((l) => l.value === locale.value));
const languageMenu = computed(() => LOCALES.map((l) => ({ label: l.label, value: l.value, selected: l.value === locale.value })));
const setLocale = (entry) => (locale.value = entry.value);

// ---- account ----
const accountMenu = computed(() => [
  { label: t("topbar.profile"), value: "profile", icon: User },
  { label: t("nav.settings"), value: "settings", icon: Settings },
  { type: "separator" },
  { label: t("topbar.signOut"), value: "logout", icon: LogOut, variant: "danger" },
]);

function onAccount(entry) {
  if (entry.value === "settings") router.push("/settings");
  else if (entry.value === "logout") {
    logout();
    router.replace({ name: "login" });
    toast.add({ title: t("topbar.signedOut"), variant: "info" });
  }
  else toast.add({ title: t("topbar.profile"), description: t("topbar.profileTodo") });
}
</script>

<template>
  <SidebarProvider collapsible="icon">
    <Sidebar>
      <SidebarHeader>
        <div class="brand">
          <img class="brand__logo" src="/favicon.svg" alt="" width="32" height="32" />
          <span class="brand__text">
            <strong>{{ t("app.short") }}</strong>
            <small>{{ t("app.subtitle") }}</small>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup v-for="group in nav" :key="group.label">
          <SidebarGroupLabel>{{ group.label }}</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuButton
              v-for="item in group.items"
              :key="item.to"
              :href="item.to"
              :icon="item.icon"
              :active="isActive(item.to)"
              :tooltip="item.label"
            >
              {{ item.label }}
              <SidebarMenuBadge v-if="item.badge">{{ item.badge }}</SidebarMenuBadge>
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuButton :icon="User" :tooltip="user?.name">
            {{ user?.name }} ({{ t("app.admin") }})
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    <div class="main">
      <header class="topbar">
        <div class="topbar__left">
          <SidebarTrigger :expand-label="t('topbar.expandSidebar')" :collapse-label="t('topbar.collapseSidebar')" />
          <Breadcrumbs :items="crumbs" size="sm" :label="t('common.breadcrumb')" />
        </div>
        <div class="topbar__right">
          <InputGroup size="sm" class="topbar__search">
            <InputGroupAddon><Search /></InputGroupAddon>
            <InputGroupInput :placeholder="t('topbar.search')" :aria-label="t('common.search')" />
          </InputGroup>
          <Dropdown :items="languageMenu" align="end" @select="setLocale">
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
          <Button variant="ghost" shape="square" size="sm" :title="t('topbar.notifications')" @click="toast.add({ title: t('topbar.noNotifications') })">
            <template #icon><Bell /></template>
          </Button>
          <Dropdown :items="accountMenu" align="end" @select="onAccount">
            <template #trigger>
              <button class="account" :aria-label="t('topbar.account')">{{ userInitials }}</button>
            </template>
          </Dropdown>
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </SidebarProvider>
</template>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: var(--kv-space-2-5);
  min-inline-size: 0;
  overflow: hidden;
}
.brand__logo {
  flex-shrink: 0;
  inline-size: 2rem;
  block-size: 2rem;
}
.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  white-space: nowrap;
}
.brand__text strong {
  font-size: var(--kv-text-sm);
  color: var(--kv-text-strong);
}
.brand__text small {
  font-size: var(--kv-text-xs);
  color: var(--kv-text-subtle);
}

.main {
  flex: 1;
  min-inline-size: 0;
  display: flex;
  flex-direction: column;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--kv-space-3);
  /* Match Kumo's SidebarHeader height (58px) so both bottom borders line up */
  block-size: 58px;
  padding-inline: var(--kv-space-4);
  background: color-mix(in oklab, var(--kv-surface-base) 85%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--kv-line);
}
.topbar__left,
.topbar__right {
  display: flex;
  align-items: center;
  gap: var(--kv-space-2);
  min-inline-size: 0;
}
.topbar__search {
  inline-size: 260px;
}
.account {
  inline-size: 2rem;
  block-size: 2rem;
  border: 0;
  border-radius: var(--kv-radius-full);
  background: var(--kv-brand);
  color: #fff;
  font: 600 var(--kv-text-xs) / 1 var(--kv-font-sans);
  cursor: pointer;
}
.content {
  flex: 1;
}
/*
 * Kumo sizes the desktop sidebar with block-size: 100%, which can't resolve
 * against the wrapper's min-height, so it shrinks to its content. Pin it to
 * the viewport instead: full height, and it stays put while the page scrolls.
 */
:deep(.kv-sidebar--desktop) {
  position: sticky;
  top: 0;
  block-size: 100svh;
  align-self: flex-start;
}
@media (max-width: 768px) {
  .topbar__search {
    display: none;
  }
}
</style>
