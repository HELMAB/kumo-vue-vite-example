<script setup>
import { LayerCard, LayerCardPrimary, LayerCardSecondary } from "@/components/ui/layer-card";
import { Text } from "@/components/ui/text";

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: "" },
  icon: { type: [Object, Function], default: undefined },
  tone: { type: String, default: "brand" }, // brand | success | warning | danger
});
</script>

<template>
  <LayerCard>
    <LayerCardSecondary class="layer-head">
      <span>{{ label }}</span>
      <span v-if="icon" class="stat__icon" :data-tone="tone"><component :is="icon" :size="16" /></span>
    </LayerCardSecondary>
    <LayerCardPrimary>
      <div class="stat__value">{{ value }}</div>
      <Text v-if="hint" variant="secondary" size="xs">{{ hint }}</Text>
    </LayerCardPrimary>
  </LayerCard>
</template>

<style scoped>
.stat__value {
  font-size: var(--kv-text-3xl);
  font-weight: 600;
  line-height: 1.2;
  color: var(--kv-text-strong);
  font-variant-numeric: tabular-nums;
}
.stat__icon {
  display: grid;
  place-items: center;
  inline-size: 1.75rem;
  block-size: 1.75rem;
  border-radius: var(--kv-radius-md);
  background: color-mix(in oklab, var(--kv-brand) 14%, transparent);
  color: var(--kv-text-brand);
}
.stat__icon[data-tone="success"] {
  background: var(--kv-success-tint);
  color: var(--kv-text-success);
}
.stat__icon[data-tone="warning"] {
  background: var(--kv-warning-tint);
  color: var(--kv-text-warning);
}
.stat__icon[data-tone="danger"] {
  background: var(--kv-danger-tint);
  color: var(--kv-text-danger);
}
</style>
