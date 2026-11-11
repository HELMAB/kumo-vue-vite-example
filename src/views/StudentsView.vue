<script setup>
import { computed, reactive, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Plus, Search, MoreHorizontal, Download, Pencil, Trash2, Eye } from "lucide-vue-next";
import PageHeader from "@/components/app/PageHeader.vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LayerCard, LayerCardPrimary, LayerCardSecondary } from "@/components/ui/layer-card";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Dropdown } from "@/components/ui/dropdown";
import { Empty } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Pagination } from "@/components/ui/pagination";
import {
  Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableCheckCell, TableCheckHead,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useLabels } from "@/composables/useLabels";
import { students, classes, grades, initials, statusVariant } from "@/data/mock";

const route = useRoute();
const router = useRouter();
const L = useLabels();
const { t } = L;

// ---- filters ----
const query = ref("");
const grade = ref("all");
const status = ref("all");
const gradeItems = computed(() => [{ label: t("students.allGrades"), value: "all" }, ...grades.map((g) => ({ label: L.grade(g), value: g }))]);
const statusItems = computed(() => [
  { label: t("students.allStatuses"), value: "all" },
  { label: L.status("active"), value: "active" },
  { label: L.status("inactive"), value: "inactive" },
]);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return students.filter(
    (s) =>
      (grade.value === "all" || s.grade === grade.value) &&
      (status.value === "all" || s.status === status.value) &&
      (!q || s.name.toLowerCase().includes(q) || String(s.id).includes(q) || s.guardian.toLowerCase().includes(q)),
  );
});

// ---- pagination ----
const page = ref(1);
const perPage = 10;
const paged = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage));
watch([query, grade, status], () => (page.value = 1));
const paginationLabels = computed(() => ({
  navigation: t("pagination.navigation"),
  firstPage: t("pagination.firstPage"),
  previousPage: t("pagination.previousPage"),
  nextPage: t("pagination.nextPage"),
  lastPage: t("pagination.lastPage"),
  pageNumber: t("pagination.pageNumber"),
  pageSize: t("pagination.pageSize"),
}));

// ---- selection ----
const selected = ref(new Set());
const allOnPage = computed(() => paged.value.length > 0 && paged.value.every((s) => selected.value.has(s.id)));
const someOnPage = computed(() => paged.value.some((s) => selected.value.has(s.id)) && !allOnPage.value);
function toggleRow(id, on) {
  const next = new Set(selected.value);
  on ? next.add(id) : next.delete(id);
  selected.value = next;
}
function togglePage(on) {
  const next = new Set(selected.value);
  paged.value.forEach((s) => (on ? next.add(s.id) : next.delete(s.id)));
  selected.value = next;
}

// ---- create / edit dialog ----
const classItems = computed(() => classes.map((c) => ({ label: `${L.cls(c.code)} · ${L.grade(c.grade)}`, value: c.code })));
const genderItems = computed(() => ["male", "female"].map((g) => ({ label: L.gender(g), value: g })));
const formStatusItems = computed(() => ["active", "inactive"].map((s) => ({ label: L.status(s), value: s })));
const blank = () => ({ id: null, name: "", gender: "male", class: "1A", guardian: "", phone: "", status: "active" });
const form = reactive(blank());
const errors = reactive({ name: "", guardian: "" });
const dialogOpen = ref(false);

function openCreate() {
  Object.assign(form, blank());
  Object.assign(errors, { name: "", guardian: "" });
  dialogOpen.value = true;
}
function openEdit(s) {
  Object.assign(form, { ...s });
  Object.assign(errors, { name: "", guardian: "" });
  dialogOpen.value = true;
}
function save() {
  errors.name = form.name.trim() ? "" : t("students.form.nameRequired");
  errors.guardian = form.guardian.trim() ? "" : t("students.form.guardianRequired");
  if (errors.name || errors.guardian) return;

  const grade = classes.find((c) => c.code === form.class)?.grade;
  if (form.id) {
    Object.assign(students.find((s) => s.id === form.id), { ...form, grade });
    toast.add({ title: t("students.updated"), description: form.name, variant: "success" });
  } else {
    const id = Math.max(...students.map((s) => s.id)) + 1;
    students.push({ ...form, id, grade, fee: "pending" });
    toast.add({ title: t("students.added"), description: t("students.addedDesc", { name: form.name, cls: L.cls(form.class) }), variant: "success" });
  }
  dialogOpen.value = false;
}

// ---- delete ----
const toDelete = ref(null);
const deleteOpen = computed({
  get: () => toDelete.value !== null,
  set: (v) => !v && (toDelete.value = null),
});
function confirmDelete() {
  const ids = toDelete.value === "selected" ? [...selected.value] : [toDelete.value.id];
  ids.forEach((id) => students.splice(students.findIndex((s) => s.id === id), 1));
  selected.value = new Set([...selected.value].filter((id) => !ids.includes(id)));
  toast.add({ title: t("students.removed", { n: ids.length }), variant: "success" });
  toDelete.value = null;
}

const rowMenu = computed(() => [
  { label: t("students.viewProfile"), value: "view", icon: Eye },
  { label: t("common.edit"), value: "edit", icon: Pencil },
  { type: "separator" },
  { label: t("common.delete"), value: "delete", icon: Trash2, variant: "danger" },
]);
function onRowAction(entry, s) {
  if (entry.value === "edit") openEdit(s);
  else if (entry.value === "delete") toDelete.value = s;
  else toast.add({ title: s.name, description: t("students.profileDesc", { id: s.id, cls: L.cls(s.class), guardian: s.guardian }) });
}

function exportCsv() {
  const rows = filtered.value.map((s) => [s.id, s.name, L.gender(s.gender), L.cls(s.class), s.guardian, s.phone, L.status(s.status)]);
  const csv = [t("students.csvHeader"), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
  const a = document.createElement("a");
  // BOM so Excel opens the Khmer text as UTF-8
  a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
  a.download = "students.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

// Open the dialog when arriving from "New student" on the dashboard
onMounted(() => {
  if (route.query.new) {
    openCreate();
    router.replace({ query: {} });
  }
});
</script>

<template>
  <div class="page">
    <PageHeader :title="t('nav.students')" :description="t('students.description', { n: students.length, c: classes.length })">
      <template #actions>
        <Button @click="exportCsv">
          <template #icon><Download /></template>
          {{ t("common.export") }}
        </Button>
        <Button variant="primary" @click="openCreate">
          <template #icon><Plus /></template>
          {{ t("students.add") }}
        </Button>
      </template>
    </PageHeader>

    <LayerCard as="section">
      <LayerCardSecondary class="toolbar">
        <InputGroup class="grow">
          <InputGroupAddon><Search /></InputGroupAddon>
          <InputGroupInput v-model="query" :placeholder="t('students.searchPlaceholder')" :aria-label="t('common.search')" />
        </InputGroup>
        <Select v-model="grade" :items="gradeItems" :aria-label="t('students.gradeFilter')" style="min-width: 160px" />
        <Select v-model="status" :items="statusItems" :aria-label="t('students.statusFilter')" style="min-width: 150px" />
        <Button v-if="selected.size" variant="secondary-destructive" @click="toDelete = 'selected'">
          <template #icon><Trash2 /></template>
          {{ t("students.deleteN", { n: selected.size }) }}
        </Button>
      </LayerCardSecondary>

      <LayerCardPrimary class="layer-flush">
        <div class="table-wrap">
          <Table v-if="filtered.length">
            <TableHeader>
              <TableRow>
                <TableCheckHead :checked="allOnPage" :indeterminate="someOnPage" @update:checked="togglePage" />
                <TableHead>{{ t("students.col.student") }}</TableHead>
                <TableHead>{{ t("students.col.id") }}</TableHead>
                <TableHead>{{ t("students.col.class") }}</TableHead>
                <TableHead>{{ t("students.col.guardian") }}</TableHead>
                <TableHead>{{ t("students.col.phone") }}</TableHead>
                <TableHead>{{ t("students.col.fee") }}</TableHead>
                <TableHead>{{ t("students.col.status") }}</TableHead>
                <TableHead><span class="sr-only">{{ t("common.actions") }}</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="s in paged" :key="s.id" :variant="selected.has(s.id) ? 'selected' : 'default'">
                <TableCheckCell :checked="selected.has(s.id)" @update:checked="(on) => toggleRow(s.id, on)" />
                <TableCell>
                  <div class="person">
                    <span class="avatar">{{ initials(s.name) }}</span>
                    <div>
                      <div>{{ s.name }}</div>
                      <div class="muted">{{ L.gender(s.gender) }}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell class="mono">#{{ s.id }}</TableCell>
                <TableCell>{{ L.cls(s.class) }}</TableCell>
                <TableCell>{{ s.guardian }}</TableCell>
                <TableCell>{{ s.phone }}</TableCell>
                <TableCell><Badge :variant="statusVariant(s.fee)" appearance="dot">{{ L.status(s.fee) }}</Badge></TableCell>
                <TableCell><Badge :variant="statusVariant(s.status)">{{ L.status(s.status) }}</Badge></TableCell>
                <TableCell>
                  <Dropdown :items="rowMenu" align="end" @select="(e) => onRowAction(e, s)">
                    <template #trigger>
                      <Button variant="ghost" shape="square" size="sm" :aria-label="t('students.actionsFor', { name: s.name })">
                        <template #icon><MoreHorizontal /></template>
                      </Button>
                    </template>
                  </Dropdown>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Empty v-else :title="t('students.emptyTitle')" :description="t('students.emptyDesc')" class="layer-section">
            <Button @click="(query = ''), (grade = 'all'), (status = 'all')">{{ t("common.clearFilters") }}</Button>
          </Empty>
        </div>

        <div v-if="filtered.length" class="layer-section">
          <Pagination v-model:page="page" :per-page="perPage" :total-count="filtered.length" :labels="paginationLabels">
            <template #text="{ pageShowingRange, totalCount }">
              {{ t("common.showing", { range: pageShowingRange, total: totalCount }) }}
            </template>
          </Pagination>
        </div>
      </LayerCardPrimary>
    </LayerCard>

    <!-- Add / edit student -->
    <Dialog
      v-model:open="dialogOpen"
      :title="form.id ? t('students.edit') : t('students.add')"
      :description="form.id ? t('students.editDesc', { id: form.id }) : t('students.addDesc')"
      :close-label="t('common.close')"
      size="lg"
    >
      <form id="student-form" class="form-grid dialog-form" @submit.prevent="save">
        <Input v-model="form.name" :label="t('students.form.name')" :placeholder="t('students.form.namePlaceholder')" required :error="errors.name" />
        <Select v-model="form.gender" :label="t('students.form.gender')" :items="genderItems" />
        <Select v-model="form.class" :label="t('students.form.class')" :items="classItems" />
        <Select v-model="form.status" :label="t('students.form.status')" :items="formStatusItems" />
        <Input v-model="form.guardian" :label="t('students.form.guardian')" :placeholder="t('students.form.guardianPlaceholder')" required :error="errors.guardian" />
        <Input v-model="form.phone" :label="t('students.form.phone')" type="tel" placeholder="012 345 678" />
      </form>
      <template #footer="{ close }">
        <Button @click="close">{{ t("common.cancel") }}</Button>
        <Button variant="primary" type="submit" form="student-form">{{ form.id ? t("common.saveChanges") : t("students.add") }}</Button>
      </template>
    </Dialog>

    <!-- Delete confirmation -->
    <Dialog
      v-model:open="deleteOpen"
      role="alertdialog"
      size="sm"
      :title="t('students.deleteTitle')"
      :description="toDelete === 'selected' ? t('students.deleteMany', { n: selected.size }) : t('students.deleteOne', { name: toDelete?.name ?? '' })"
      :close-label="t('common.close')"
    >
      <template #footer="{ close }">
        <Button @click="close">{{ t("common.cancel") }}</Button>
        <Button variant="destructive" @click="confirmDelete">{{ t("common.delete") }}</Button>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.mono {
  font-family: var(--kv-font-mono);
  font-size: var(--kv-text-xs);
  color: var(--kv-text-subtle);
}
.sr-only {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
