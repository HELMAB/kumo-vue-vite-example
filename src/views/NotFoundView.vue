<script setup>
import { useI18n } from "vue-i18n";
import { SearchX } from "lucide-vue-next";
import { Empty } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

const { t } = useI18n();
</script>

<template>
  <div class="page">
    <Empty :title="t('notFound.title')" :description="t('notFound.description')" size="lg">
      <template #icon><SearchX /></template>
      <Button variant="primary" @click="$router.push('/')">{{ t("notFound.back") }}</Button>
    </Empty>
  </div>
</template>
