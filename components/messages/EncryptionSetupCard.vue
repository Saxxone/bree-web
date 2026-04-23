<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useCryptoStore } from "~/store/crypto";
import { useGlobalStore } from "~/store/global";

const { t } = useI18n();
const cryptoStore = useCryptoStore();
const { registering } = storeToRefs(cryptoStore);
const { addSnack } = useGlobalStore();

async function onRegister() {
  try {
    await cryptoStore.registerThisDevice();
  } catch (err) {
    addSnack({
      type: "error",
      message: err instanceof Error ? err.message : t("common.error"),
    });
  }
}

// The setup card is only mounted when the user has no registered device for
// this browser, so we only need one CTA: register this device and move on.
const bullets = computed(() => [
  t("security.setup_bullet_e2ee"),
  t("security.setup_bullet_per_device"),
  t("security.setup_bullet_no_backup"),
]);
</script>

<template>
  <div
    class="mx-auto w-full max-w-md rounded-2xl border border-gray-300 bg-white px-5 py-6 text-left shadow-md dark:border-gray-600 dark:bg-gray-800 dark:shadow-black/30"
  >
    <div class="mb-6 flex flex-col items-center text-center">
      <div
        class="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/20"
        aria-hidden="true"
      >
        <Icon
          icon="mdi:shield-lock"
          class="text-4xl text-indigo-500 dark:text-indigo-300"
        />
      </div>
      <h2 class="mb-2 px-1 text-xl font-bold text-gray-900 dark:text-gray-50">
        {{ t("security.setup_device_title") }}
      </h2>
      <p class="text-base leading-relaxed text-gray-700 dark:text-slate-300">
        {{ t("security.setup_device_hint") }}
      </p>
    </div>

    <ul class="mb-6 flex flex-col gap-3">
      <li
        v-for="(line, i) in bullets"
        :key="i"
        class="flex gap-3 text-left text-sm leading-relaxed text-gray-800 dark:text-gray-100"
      >
        <Icon
          icon="mdi:check-circle"
          class="mt-0.5 shrink-0 text-xl text-indigo-500 dark:text-indigo-300"
        />
        <span>{{ line }}</span>
      </li>
    </ul>

    <button
      type="button"
      class="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-indigo-500 px-4 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:bg-indigo-700 disabled:cursor-wait disabled:opacity-90 dark:shadow-indigo-950/40"
      :disabled="registering"
      @click="onRegister"
    >
      <span
        v-if="registering"
        class="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"
        aria-hidden="true"
      />
      <Icon
        v-else
        icon="mdi:key-variant"
        class="shrink-0 text-xl text-white"
        aria-hidden="true"
      />
      <span>{{ t("security.setup_device_cta") }}</span>
    </button>
  </div>
</template>
