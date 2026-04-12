<script setup lang="ts">
import { clearCoinUnlockResume } from "~/utils/coinCheckoutResume";
import app_routes from "~/utils/routes";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();

onMounted(() => {
  if (import.meta.client) {
    clearCoinUnlockResume();
  }
});
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-12 text-center">
    <p class="text-main text-lg font-medium">
      {{ t("coins.cancel_title") }}
    </p>
    <p class="text-muted mt-2 text-sm">
      {{ t("coins.cancel_hint") }}
    </p>
    <NuxtLink
      :to="app_routes.home"
      class="text-violet-600 mt-6 inline-block text-sm font-medium"
    >
      {{ t("coins.success_back_home") }}
    </NuxtLink>
  </div>
</template>
