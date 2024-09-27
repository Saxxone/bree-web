<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";
import { useAuthStore } from "~/store/auth";

definePageMeta({
  layout: "base",
});

const globalStore = useGlobalStore();
const authStore = useAuthStore();
const { t } = useI18n();

onMounted(() => {
  useGlobalStore().page_name = t("profile.edit");
});
</script>

<template>
  <div />
</template>
