<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";
import { useAuthStore } from "~/store/auth";

definePageMeta({
  layout: "base",
});

const globalStore = useGlobalStore();
const { page_name } = storeToRefs(globalStore);

const { t } = useI18n();

onMounted(() => {
  page_name.value = t("profile.edit");
});
</script>

<template>
  <div />
</template>
