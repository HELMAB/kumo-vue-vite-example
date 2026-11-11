<script setup>
import { RouterLink, RouterView } from "vue-router";
import { useI18n } from "vue-i18n";
import { LinkProvider } from "@/components/ui/link";
import { Toaster } from "@/components/ui/toast";

const { t } = useI18n();
</script>

<template>
  <!-- Every Kumo link (sidebar items, breadcrumbs…) renders as a RouterLink -->
  <LinkProvider :component="RouterLink">
    <RouterView />
  </LinkProvider>
  <Toaster
    :label="t('common.notificationsRegion')"
    :announce-label="t('common.notification')"
    :close-label="t('common.close')"
  />
</template>
