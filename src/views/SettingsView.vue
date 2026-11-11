<script setup>
import { computed, reactive, ref } from "vue";
import PageHeader from "@/components/app/PageHeader.vue";
import { Button } from "@/components/ui/button";
import { LayerCard, LayerCardPrimary, LayerCardSecondary } from "@/components/ui/layer-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { useTheme } from "@/composables/useTheme";
import { useLabels } from "@/composables/useLabels";
import { LOCALES } from "@/i18n";

const L = useLabels();
const { t, locale } = L;
const { isDark } = useTheme();
const tab = ref("school");
const tabItems = computed(() => ["school", "academic", "notifications"].map((v) => ({ label: t(`settings.tabs.${v}`), value: v })));
const termItems = computed(() => [1, 2, 3].map((n) => ({ label: L.term(n), value: n })));

const school = reactive({
  name: "សាលាបឋមសិក្សា រះអរុណ",
  email: "office@sunrise.edu.kh",
  phone: "023 456 789",
  address: "ផ្លូវ ២៧១ រាជធានីភ្នំពេញ",
  year: "2026-27",
  term: 2,
});
const prefs = reactive({ smsGuardians: true, emailReports: true, weeklyDigest: false, lateAlert: true });

const save = () => toast.add({ title: t("settings.saved"), variant: "success" });
</script>

<template>
  <div class="page">
    <PageHeader :title="t('nav.settings')" :description="t('settings.description')" />

    <LayerCard as="section">
      <LayerCardSecondary>
        <Tabs v-model="tab" :items="tabItems" :label="t('settings.sections')" />
      </LayerCardSecondary>
      <LayerCardPrimary class="layer-flush">
        <div class="layer-section settings__body">
          <div v-if="tab === 'school'" class="form-grid">
            <Input v-model="school.name" :label="t('settings.schoolName')" required />
            <Input v-model="school.email" :label="t('settings.email')" type="email" />
            <Input v-model="school.phone" :label="t('settings.phone')" type="tel" />
            <Input v-model="school.address" :label="t('settings.address')" />
          </div>

          <div v-else-if="tab === 'academic'" class="form-grid">
            <Select v-model="locale" :label="t('settings.language')" :items="LOCALES" />
            <Select v-model="school.year" :label="t('settings.year')" :items="['2025-26', '2026-27', '2027-28']" />
            <Select v-model="school.term" :label="t('settings.currentTerm')" :items="termItems" />
            <Input :label="t('settings.dayStarts')" type="time" model-value="07:00" />
            <Input :label="t('settings.dayEnds')" type="time" model-value="17:00" />
          </div>

          <div v-else class="stack">
            <Switch v-model="prefs.smsGuardians" :label="t('settings.smsGuardians')" :description="t('settings.smsGuardiansDesc')" />
            <Switch v-model="prefs.lateAlert" :label="t('settings.lateAlert')" :description="t('settings.lateAlertDesc')" />
            <Switch v-model="isDark" :label="t('settings.darkMode')" :description="t('settings.darkModeDesc')" />
            <Checkbox v-model="prefs.emailReports" :label="t('settings.emailReports')" />
            <Checkbox v-model="prefs.weeklyDigest" :label="t('settings.weeklyDigest')" />
          </div>
        </div>
        <div class="layer-section actions">
          <Button>{{ t("common.cancel") }}</Button>
          <Button variant="primary" @click="save">{{ t("common.saveChanges") }}</Button>
        </div>
      </LayerCardPrimary>
    </LayerCard>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--kv-space-5);
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--kv-space-2);
}
.settings__body {
  padding: var(--kv-space-5);
}
</style>
