<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";

definePageMeta({
  layout: "social",
});

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const { t } = useI18n();

onBeforeMount(() => {
  page_title.value = t("messages.page_title");
});
</script>

<template>
  <div />
</template>
