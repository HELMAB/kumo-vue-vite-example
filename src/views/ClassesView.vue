<script setup>
import { computed, ref } from "vue";
import { DoorOpen, UserRound } from "lucide-vue-next";
import PageHeader from "@/components/app/PageHeader.vue";
import { LayerCard, LayerCardPrimary, LayerCardSecondary } from "@/components/ui/layer-card";
import { Grid } from "@/components/ui/grid";
import { Meter } from "@/components/ui/meter";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { useLabels } from "@/composables/useLabels";
import { classes, grades } from "@/data/mock";

const L = useLabels();
const { t } = L;
const grade = ref("all");
const tabItems = computed(() => [{ label: t("classes.all"), value: "all" }, ...grades.map((g) => ({ label: L.grade(g), value: g }))]);
const list = computed(() => (grade.value === "all" ? classes : classes.filter((c) => c.grade === grade.value)));
</script>

<template>
  <div class="page">
    <PageHeader :title="t('nav.classes')" :description="t('classes.description')" />

    <Tabs v-model="grade" :items="tabItems" variant="underline" :label="t('classes.filter')" />

    <Grid variant="3up">
      <LayerCard v-for="c in list" :key="c.code" as="article">
        <LayerCardSecondary class="layer-head">
          <span class="klass__title">
            <span class="klass__code">{{ L.cls(c.code) }}</span>
            {{ t("classes.title", { grade: L.grade(c.grade), section: t("section", { s: L.section(c.section) }) }) }}
          </span>
          <Badge v-if="c.enrolled >= c.capacity - 2" variant="warning">{{ t("classes.nearlyFull") }}</Badge>
          <Badge v-else variant="success">{{ t("classes.available") }}</Badge>
        </LayerCardSecondary>
        <LayerCardPrimary class="layer-body">
          <div class="muted klass__meta">
            <span><DoorOpen :size="14" /> {{ t("room", { n: c.room }) }}</span>
            <span><UserRound :size="14" /> {{ L.teacher(c.teacher) }}</span>
          </div>
          <Meter :label="t('classes.enrolment')" :value="c.enrolled" :max="c.capacity" :custom-value="`${c.enrolled} / ${c.capacity}`" />
        </LayerCardPrimary>
      </LayerCard>
    </Grid>
  </div>
</template>

<style scoped>
.klass__title {
  display: inline-flex;
  align-items: center;
  gap: var(--kv-space-2);
  color: var(--kv-text-strong);
}
.klass__code {
  display: grid;
  place-items: center;
  min-inline-size: 2rem;
  block-size: 2rem;
  padding-inline: var(--kv-space-1-5);
  border-radius: var(--kv-radius-md);
  background: color-mix(in oklab, var(--kv-brand) 14%, transparent);
  color: var(--kv-text-brand);
  font-weight: 700;
}
.klass__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kv-space-3);
}
.klass__meta span {
  display: inline-flex;
  align-items: center;
  gap: var(--kv-space-1);
}
</style>
