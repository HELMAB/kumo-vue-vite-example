<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { GraduationCap, Users, CalendarCheck, Wallet, Plus } from "lucide-vue-next";
import PageHeader from "@/components/app/PageHeader.vue";
import StatCard from "@/components/app/StatCard.vue";
import { Grid } from "@/components/ui/grid";
import { LayerCard, LayerCardPrimary, LayerCardSecondary } from "@/components/ui/layer-card";
import { Meter } from "@/components/ui/meter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { useLabels } from "@/composables/useLabels";
import { students, teachers, classes, fees, events, initials, statusVariant } from "@/data/mock";

const L = useLabels();
const { t } = L;

const activeStudents = computed(() => students.filter((s) => s.status === "active").length);
const overdue = computed(() => fees.filter((f) => f.status === "overdue"));
const collected = computed(() => fees.filter((f) => f.status === "paid").reduce((sum, f) => sum + f.amount, 0));
const recent = computed(() => students.slice(-5).reverse());

const attendanceByGrade = [96, 93, 91, 94, 88, 90].map((value, i) => ({ grade: i + 1, value }));
</script>

<template>
  <div class="page">
    <PageHeader :title="t('nav.dashboard')" :description="t('dashboard.description')">
      <template #actions>
        <Button variant="primary" @click="$router.push({ path: '/students', query: { new: 1 } })">
          <template #icon><Plus /></template>
          {{ t("dashboard.newStudent") }}
        </Button>
      </template>
    </PageHeader>

    <Grid variant="4up">
      <StatCard :label="t('dashboard.students')" :value="students.length" :hint="t('dashboard.activeCount', { n: activeStudents })" :icon="GraduationCap" />
      <StatCard :label="t('dashboard.teachers')" :value="teachers.length" :hint="t('dashboard.classCount', { n: classes.length })" :icon="Users" tone="success" />
      <StatCard :label="t('dashboard.attendanceToday')" value="92%" :hint="t('dashboard.vsLastWeek')" :icon="CalendarCheck" tone="warning" />
      <StatCard :label="t('dashboard.feesCollected')" :value="L.money(collected)" :hint="t('dashboard.overdueCount', { n: overdue.length })" :icon="Wallet" tone="danger" />
    </Grid>

    <Grid variant="2-1">
      <LayerCard as="section">
        <LayerCardSecondary class="layer-head">
          <strong>{{ t("dashboard.recentlyEnrolled") }}</strong>
          <RouterLink to="/students" class="muted">{{ t("common.viewAll") }}</RouterLink>
        </LayerCardSecondary>
        <LayerCardPrimary class="layer-flush table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ t("students.col.student") }}</TableHead>
                <TableHead>{{ t("students.col.class") }}</TableHead>
                <TableHead>{{ t("students.col.guardian") }}</TableHead>
                <TableHead>{{ t("students.col.status") }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="s in recent" :key="s.id">
                <TableCell>
                  <div class="person"><span class="avatar">{{ initials(s.name) }}</span>{{ s.name }}</div>
                </TableCell>
                <TableCell>{{ L.cls(s.class) }}</TableCell>
                <TableCell>{{ s.guardian }}</TableCell>
                <TableCell><Badge :variant="statusVariant(s.status)">{{ L.status(s.status) }}</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </LayerCardPrimary>
      </LayerCard>

      <LayerCard as="section">
        <LayerCardSecondary class="layer-head"><strong>{{ t("dashboard.upcomingEvents") }}</strong></LayerCardSecondary>
        <LayerCardPrimary class="layer-flush">
          <ul class="events">
            <li v-for="e in events" :key="e.title">
              <span class="events__date">{{ L.date(e.date, { day: "numeric", month: "short" }) }}</span>
              <span class="events__title">{{ t(`dashboard.events.${e.title}`) }}</span>
              <Badge :variant="e.variant">{{ t(`dashboard.tags.${e.tag}`) }}</Badge>
            </li>
          </ul>
        </LayerCardPrimary>
      </LayerCard>
    </Grid>

    <Grid variant="2up">
      <LayerCard as="section">
        <LayerCardSecondary class="layer-head"><strong>{{ t("dashboard.attendanceByGrade") }}</strong></LayerCardSecondary>
        <LayerCardPrimary class="layer-body">
          <Meter v-for="a in attendanceByGrade" :key="a.grade" :label="L.grade(a.grade)" :value="a.value" :custom-value="`${a.value}%`" />
        </LayerCardPrimary>
      </LayerCard>
      <LayerCard as="section">
        <LayerCardSecondary class="layer-head"><strong>{{ t("dashboard.classCapacity") }}</strong></LayerCardSecondary>
        <LayerCardPrimary class="layer-body">
          <Meter
            v-for="c in classes.slice(0, 6)"
            :key="c.code"
            :label="`${L.classLabel(c.code)} · ${L.teacher(c.teacher)}`"
            :value="c.enrolled"
            :max="c.capacity"
            :custom-value="`${c.enrolled}/${c.capacity}`"
          />
        </LayerCardPrimary>
      </LayerCard>
    </Grid>
  </div>
</template>

<style scoped>
.events {
  list-style: none;
  margin: 0;
  padding: 0;
}
.events li {
  display: grid;
  grid-template-columns: 4.5rem 1fr auto;
  align-items: center;
  gap: var(--kv-space-3);
  padding: var(--kv-space-3) var(--kv-space-4);
}
.events li + li {
  border-top: 1px solid var(--kv-line);
}
.events__date {
  font-size: var(--kv-text-xs);
  font-weight: 600;
  color: var(--kv-text-brand);
}
.events__title {
  font-size: var(--kv-text-sm);
}
</style>
