<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);

onBeforeMount(() => {
  page_title.value = t("profile.edit");
});
</script>

<template>
  <div />
</template>
