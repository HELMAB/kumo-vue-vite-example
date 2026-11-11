<script setup>
import { computed, ref } from "vue";
import { Wallet, AlertTriangle, Clock, Send } from "lucide-vue-next";
import PageHeader from "@/components/app/PageHeader.vue";
import StatCard from "@/components/app/StatCard.vue";
import { LayerCard, LayerCardPrimary, LayerCardSecondary } from "@/components/ui/layer-card";
import { Grid } from "@/components/ui/grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useLabels } from "@/composables/useLabels";
import { fees, statusVariant } from "@/data/mock";

const L = useLabels();
const { t } = L;
const tab = ref("all");
const count = (s) => fees.filter((f) => f.status === s).length;
const tabs = computed(() => [
  { label: t("fees.all", { n: fees.length }), value: "all" },
  { label: t("fees.tabPaid", { n: count("paid") }), value: "paid" },
  { label: t("fees.tabPending", { n: count("pending") }), value: "pending" },
  { label: t("fees.tabOverdue", { n: count("overdue") }), value: "overdue" },
]);
const list = computed(() => (tab.value === "all" ? fees : fees.filter((f) => f.status === tab.value)));
const sum = (status) => fees.filter((f) => f.status === status).reduce((total, f) => total + f.amount, 0);

function markPaid(f) {
  f.status = "paid";
  toast.add({ title: t("fees.recorded"), description: `${f.invoice} · ${L.money(f.amount)}`, variant: "success" });
}
function remind(f) {
  toast.add({ title: t("fees.reminderSent"), description: t("fees.reminderDesc", { name: f.student }), variant: "info" });
}
</script>

<template>
  <div class="page">
    <PageHeader :title="t('nav.fees')" :description="t('fees.description')" />

    <Grid variant="3up">
      <StatCard :label="t('fees.collected')" :value="L.money(sum('paid'))" :icon="Wallet" tone="success" />
      <StatCard :label="t('fees.pending')" :value="L.money(sum('pending'))" :icon="Clock" tone="warning" />
      <StatCard :label="t('fees.overdue')" :value="L.money(sum('overdue'))" :icon="AlertTriangle" tone="danger" />
    </Grid>

    <LayerCard as="section">
      <LayerCardSecondary>
        <Tabs v-model="tab" :items="tabs" :label="t('fees.filter')" />
      </LayerCardSecondary>
      <LayerCardPrimary class="layer-flush table-wrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t("fees.col.invoice") }}</TableHead>
              <TableHead>{{ t("fees.col.student") }}</TableHead>
              <TableHead>{{ t("fees.col.class") }}</TableHead>
              <TableHead>{{ t("fees.col.term") }}</TableHead>
              <TableHead>{{ t("fees.col.due") }}</TableHead>
              <TableHead>{{ t("fees.col.amount") }}</TableHead>
              <TableHead>{{ t("fees.col.status") }}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="f in list" :key="f.invoice">
              <TableCell class="mono">{{ f.invoice }}</TableCell>
              <TableCell>{{ f.student }}</TableCell>
              <TableCell>{{ L.cls(f.class) }}</TableCell>
              <TableCell>{{ L.term(f.term) }}</TableCell>
              <TableCell>{{ L.date(f.due) }}</TableCell>
              <TableCell><strong>{{ L.money(f.amount) }}</strong></TableCell>
              <TableCell><Badge :variant="statusVariant(f.status)">{{ L.status(f.status) }}</Badge></TableCell>
              <TableCell>
                <div v-if="f.status !== 'paid'" class="row-actions">
                  <Button size="sm" variant="ghost" @click="remind(f)">
                    <template #icon><Send /></template>
                    {{ t("fees.remind") }}
                  </Button>
                  <Button size="sm" @click="markPaid(f)">{{ t("fees.markPaid") }}</Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </LayerCardPrimary>
    </LayerCard>
  </div>
</template>

<style scoped>
.mono {
  font-family: var(--kv-font-mono);
  font-size: var(--kv-text-xs);
}
.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--kv-space-1);
}
</style>
