<script setup>
import { computed, ref, watch } from "vue";
import { Save, CheckCheck } from "lucide-vue-next";
import PageHeader from "@/components/app/PageHeader.vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayerCard, LayerCardPrimary, LayerCardSecondary } from "@/components/ui/layer-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useLabels } from "@/composables/useLabels";
import { students, classes, initials } from "@/data/mock";

const L = useLabels();
const { t } = L;
const date = ref(new Date().toISOString().slice(0, 10));
const klass = ref(classes[0].code);
const classItems = computed(() => classes.map((c) => ({ label: `${L.classLabel(c.code)} · ${L.teacher(c.teacher)}`, value: c.code })));

const roster = computed(() => students.filter((s) => s.class === klass.value && s.status === "active"));
const present = ref({});
watch(
  [roster, date],
  () => (present.value = Object.fromEntries(roster.value.map((s) => [s.id, true]))),
  { immediate: true },
);

const presentCount = computed(() => roster.value.filter((s) => present.value[s.id]).length);
const saving = ref(false);

function markAll() {
  roster.value.forEach((s) => (present.value[s.id] = true));
}
async function save() {
  saving.value = true;
  await new Promise((r) => setTimeout(r, 600)); // pretend API call
  saving.value = false;
  toast.add({
    title: t("attendance.saved"),
    description: t("attendance.savedDesc", { cls: L.cls(klass.value), date: L.date(date.value), present: presentCount.value, total: roster.value.length }),
    variant: "success",
  });
}
</script>

<template>
  <div class="page">
    <PageHeader :title="t('nav.attendance')" :description="t('attendance.description')" />

    <LayerCard as="section">
      <LayerCardSecondary class="toolbar">
        <Input v-model="date" type="date" :label="t('attendance.date')" />
        <Select v-model="klass" :items="classItems" :label="t('attendance.class')" style="min-width: 260px" />
        <div class="summary">
          <Badge variant="success">{{ t("attendance.presentCount", { n: presentCount }) }}</Badge>
          <Badge variant="error">{{ t("attendance.absentCount", { n: roster.length - presentCount }) }}</Badge>
        </div>
      </LayerCardSecondary>

      <LayerCardPrimary class="layer-flush">
        <div class="table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ t("attendance.col.no") }}</TableHead>
                <TableHead>{{ t("attendance.col.student") }}</TableHead>
                <TableHead>{{ t("attendance.col.phone") }}</TableHead>
                <TableHead>{{ t("attendance.col.present") }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(s, i) in roster" :key="s.id">
                <TableCell>{{ i + 1 }}</TableCell>
                <TableCell><div class="person"><span class="avatar">{{ initials(s.name) }}</span>{{ s.name }}</div></TableCell>
                <TableCell>{{ s.phone }}</TableCell>
                <TableCell>
                  <Switch v-model="present[s.id]" :label="present[s.id] ? t('attendance.present') : t('attendance.absent')" control-first />
                </TableCell>
              </TableRow>
              <TableRow v-if="!roster.length">
                <TableCell colspan="4" class="muted">{{ t("attendance.empty") }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div class="layer-section actions">
          <Button @click="markAll">
            <template #icon><CheckCheck /></template>
            {{ t("attendance.markAll") }}
          </Button>
          <Button variant="primary" :loading="saving" :disabled="!roster.length" @click="save">
            <template #icon><Save /></template>
            {{ t("attendance.save") }}
          </Button>
        </div>
      </LayerCardPrimary>
    </LayerCard>
  </div>
</template>

<style scoped>
.summary {
  display: flex;
  gap: var(--kv-space-2);
  margin-inline-start: auto;
  padding-block-end: var(--kv-space-1-5);
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--kv-space-2);
}
</style>
