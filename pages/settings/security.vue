<script lang="ts" setup>
import { useCryptoStore } from "~/store/crypto";
import { useGlobalStore } from "~/store/global";
import { FetchMethod } from "~/types/types";
import api_routes from "~/utils/api_routes";

definePageMeta({
  layout: "base",
});

interface DeviceSummary {
  id: string;
  userId: string;
  label: string;
  identityKeyCurve25519: string;
  identityKeyEd25519: string;
  createdAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
}

const { t } = useI18n();
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const cryptoStore = useCryptoStore();
const { deviceId } = storeToRefs(cryptoStore);

const devices = ref<DeviceSummary[]>([]);
const loading = ref(false);
const busyId = ref<string | null>(null);
const errorText = ref<string | null>(null);

function formatFingerprint(key: string): string {
  return key.match(/.{1,4}/g)?.join(" ") ?? key;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

async function fetchDevices() {
  loading.value = true;
  errorText.value = null;
  try {
    const res = await useApiConnect<undefined, DeviceSummary[]>(
      api_routes.devices.mine,
      FetchMethod.GET,
    );
    if (Array.isArray(res)) {
      devices.value = res;
    } else {
      errorText.value = (res as { message?: string }).message ?? "";
    }
  } finally {
    loading.value = false;
  }
}

async function revoke(d: DeviceSummary) {
  if (d.revokedAt) return;
  busyId.value = d.id;
  try {
    const res = await useApiConnect<undefined, { id: string }>(
      api_routes.devices.revoke(d.id),
      FetchMethod.DELETE,
    );
    if (res && typeof res === "object" && "status" in res) {
      errorText.value = (res as { message?: string }).message ?? "";
      return;
    }
    if (d.id === deviceId.value) {
      await cryptoStore.wipe();
    }
    await fetchDevices();
  } finally {
    busyId.value = null;
  }
}

onMounted(() => {
  page_title.value = t("security.devices_title");
  fetchDevices();
});
</script>

<template>
  <div class="mx-auto max-w-2xl p-4 lg:pt-8">
    <h1 class="mb-2 text-2xl font-semibold">
      {{ t("security.devices_title") }}
    </h1>
    <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
      {{ t("security.devices_hint") }}
    </p>

    <div v-if="loading" class="text-sm text-gray-500">Loading…</div>
    <div
      v-else-if="errorText"
      class="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
    >
      {{ errorText }}
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="d in devices"
        :key="d.id"
        class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium truncate">{{ d.label }}</span>
              <span
                v-if="d.id === deviceId"
                class="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
              >
                {{ t("security.devices_this_device") }}
              </span>
              <span
                v-if="d.revokedAt"
                class="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                revoked
              </span>
            </div>
            <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {{ t("security.devices_last_seen") }}:
              {{ formatDate(d.lastSeenAt) }}
            </div>
            <div class="mt-2">
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ t("security.devices_fingerprint") }}
              </div>
              <code
                class="mt-1 block break-all rounded bg-gray-100 p-2 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              >
                {{ formatFingerprint(d.identityKeyEd25519) }}
              </code>
            </div>
          </div>
          <button
            v-if="!d.revokedAt"
            :disabled="busyId === d.id"
            class="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
            @click="revoke(d)"
          >
            {{ t("security.devices_revoke") }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
