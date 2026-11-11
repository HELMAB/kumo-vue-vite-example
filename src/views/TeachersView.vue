<script setup>
import { computed, ref } from "vue";
import { Plus, Search, Mail, Phone } from "lucide-vue-next";
import PageHeader from "@/components/app/PageHeader.vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayerCard, LayerCardPrimary, LayerCardSecondary } from "@/components/ui/layer-card";
import { Grid } from "@/components/ui/grid";
import { Tabs } from "@/components/ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useLabels } from "@/composables/useLabels";
import { teachers, initials, statusVariant } from "@/data/mock";

const L = useLabels();
const { t } = L;
const view = ref("cards");
const query = ref("");
const viewItems = computed(() => [
  { label: t("teachers.cards"), value: "cards" },
  { label: t("teachers.table"), value: "table" },
]);
const list = computed(() => {
  const q = query.value.toLowerCase();
  // search both the stored name and the translated subject
  return teachers.filter((tc) => tc.name.toLowerCase().includes(q) || L.subject(tc.subject).toLowerCase().includes(q));
});
</script>

<template>
  <div class="page">
    <PageHeader :title="t('nav.teachers')" :description="t('teachers.description', { n: teachers.length })">
      <template #actions>
        <Button variant="primary" @click="toast.add({ title: t('teachers.add'), description: t('teachers.addTodo') })">
          <template #icon><Plus /></template>
          {{ t("teachers.add") }}
        </Button>
      </template>
    </PageHeader>

    <div class="toolbar">
      <InputGroup class="grow">
        <InputGroupAddon><Search /></InputGroupAddon>
        <InputGroupInput v-model="query" :placeholder="t('teachers.searchPlaceholder')" :aria-label="t('common.search')" />
      </InputGroup>
      <Tabs v-model="view" :items="viewItems" :label="t('teachers.view')" />
    </div>

    <Grid v-if="view === 'cards'" variant="3up">
      <LayerCard v-for="tc in list" :key="tc.id" as="article">
        <LayerCardSecondary class="layer-head">
          <span>{{ L.subject(tc.subject) }}</span>
          <Badge :variant="statusVariant(tc.status)">{{ L.status(tc.status) }}</Badge>
        </LayerCardSecondary>
        <LayerCardPrimary class="layer-body">
          <div class="person">
            <span class="avatar avatar--lg">{{ initials(tc.name) }}</span>
            <strong>{{ tc.name }}</strong>
          </div>
          <div class="teacher__classes">
            <Badge v-for="c in tc.classes" :key="c" variant="neutral-subtle">{{ L.classLabel(c) }}</Badge>
          </div>
          <div class="teacher__contact muted">
            <span><Mail :size="14" /> {{ tc.email }}</span>
            <span><Phone :size="14" /> {{ tc.phone }}</span>
          </div>
        </LayerCardPrimary>
      </LayerCard>
    </Grid>

    <LayerCard v-else as="section" class="table-wrap">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{{ t("teachers.col.name") }}</TableHead>
            <TableHead>{{ t("teachers.col.subject") }}</TableHead>
            <TableHead>{{ t("teachers.col.classes") }}</TableHead>
            <TableHead>{{ t("teachers.col.email") }}</TableHead>
            <TableHead>{{ t("teachers.col.phone") }}</TableHead>
            <TableHead>{{ t("teachers.col.status") }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="tc in list" :key="tc.id">
            <TableCell><div class="person"><span class="avatar">{{ initials(tc.name) }}</span>{{ tc.name }}</div></TableCell>
            <TableCell>{{ L.subject(tc.subject) }}</TableCell>
            <TableCell>{{ tc.classes.map(L.cls).join(", ") }}</TableCell>
            <TableCell>{{ tc.email }}</TableCell>
            <TableCell>{{ tc.phone }}</TableCell>
            <TableCell><Badge :variant="statusVariant(tc.status)">{{ L.status(tc.status) }}</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </LayerCard>
  </div>
</template>

<style scoped>
.avatar--lg {
  inline-size: 2.75rem;
  block-size: 2.75rem;
  font-size: var(--kv-text-sm);
}
.teacher__classes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kv-space-1-5);
}
.teacher__contact {
  display: flex;
  flex-direction: column;
  gap: var(--kv-space-1);
}
.teacher__contact span {
  display: inline-flex;
  align-items: center;
  gap: var(--kv-space-2);
}
</style>
