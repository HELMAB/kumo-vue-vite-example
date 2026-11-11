<script setup>
import { Text } from "@/components/ui/text";

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
});
</script>

<template>
  <div class="page-header">
    <div>
      <Text variant="heading" size="lg" as="h1" class="page-header__title">{{ title }}</Text>
      <Text v-if="description" variant="secondary">{{ description }}</Text>
    </div>
    <div v-if="$slots.actions" class="page-header__actions"><slot name="actions" /></div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--kv-space-4);
}
.page-header__title {
  font-size: var(--kv-text-2xl) !important;
  margin: 0 0 var(--kv-space-1);
}
.page-header__actions {
  display: flex;
  gap: var(--kv-space-2);
}
</style>
