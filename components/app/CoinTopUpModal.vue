<script setup lang="ts">
import { isApiError, useCoinsStore } from "~/store/coins";
import { useGlobalStore } from "~/store/global";
import type { CoinPackage } from "~/types/coins";
import type { CoinUnlockResumePayload } from "~/utils/coinCheckoutResume";
import { writeCoinUnlockResume } from "~/utils/coinCheckoutResume";

const show = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    /** Written to sessionStorage before Stripe redirect */
    resume?: CoinUnlockResumePayload | null;
    loading?: boolean;
  }>(),
  {
    resume: null,
    loading: false,
  },
);

const { t } = useI18n();
const coinsStore = useCoinsStore();
const globalStore = useGlobalStore();

const packages = ref<CoinPackage[]>([]);
const loadError = ref(false);
const selectedId = ref<string | null>(null);
const checkoutLoading = ref(false);

const webPackages = computed(() =>
  packages.value.filter((p) => p.stripePriceId),
);

function selectPackage(pkg: CoinPackage) {
  if (!pkg.stripePriceId) return;
  selectedId.value = pkg.id;
}

async function loadPackages() {
  loadError.value = false;
  const res = await coinsStore.fetchPackages();
  if (isApiError(res)) {
    loadError.value = true;
    packages.value = [];
    return;
  }
  packages.value = res;
  const first = webPackages.value[0];
  selectedId.value = first?.id ?? null;
}

watch(show, (open) => {
  if (!import.meta.client) return;
  document.body.classList.toggle("overflow-hidden", !!open);
  if (open) {
    loadPackages();
  }
});

function onBackdrop() {
  if (checkoutLoading.value || props.loading) return;
  show.value = false;
}

function onKeydown(e: KeyboardEvent) {
  if (!show.value || checkoutLoading.value || props.loading) return;
  if (e.key === "Escape") onBackdrop();
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener("keydown", onKeydown);
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener("keydown", onKeydown);
    document.body.classList.remove("overflow-hidden");
  }
});

async function onCheckout() {
  if (!selectedId.value || checkoutLoading.value || !webPackages.value.length)
    return;
  checkoutLoading.value = true;
  try {
    writeCoinUnlockResume(props.resume ?? {});
    const res = await coinsStore.createStripeCheckoutSession(selectedId.value);
    if (isApiError(res)) {
      globalStore.addSnack({ type: "error", message: res.message });
      checkoutLoading.value = false;
      return;
    }
    if (res.url) {
      window.location.href = res.url;
      return;
    }
    globalStore.addSnack({
      type: "error",
      message: t("coins.topup_no_checkout_url"),
    });
  } finally {
    checkoutLoading.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[210] flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="t('coins.topup_title')"
      @click.self="onBackdrop"
    >
      <div class="bg-base-white max-w-md rounded-xl p-6 shadow-lg" @click.stop>
        <div class="mb-4 flex items-center gap-2">
          <IconsLineCoins
            :size="28"
            class="text-main shrink-0"
            aria-hidden="true"
          />
          <h2 class="text-main text-lg font-semibold leading-snug">
            {{ t("coins.topup_title") }}
          </h2>
        </div>

        <p class="text-muted mb-4 text-sm leading-relaxed">
          {{ t("coins.topup_subtitle") }}
        </p>

        <div v-if="loadError" class="text-sub mb-4 text-sm">
          {{ t("coins.topup_load_error") }}
        </div>

        <div
          v-else-if="!packages.length && show"
          class="text-muted mb-4 text-sm"
        >
          {{ t("coins.topup_no_packages") }}
        </div>

        <p
          v-else-if="packages.length && !webPackages.length && show"
          class="text-muted mb-4 text-sm leading-relaxed"
        >
          {{ t("coins.topup_no_web_packages") }}
        </p>

        <ul
          v-else-if="packages.length"
          class="mb-6 max-h-60 space-y-2 overflow-y-auto"
          role="listbox"
          :aria-label="t('coins.topup_packages_aria')"
        >
          <li v-for="pkg in packages" :key="pkg.id">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left text-sm transition-colors"
              :class="
                !pkg.stripePriceId
                  ? 'border-base-dark/10 cursor-not-allowed opacity-60'
                  : selectedId === pkg.id
                    ? 'border-violet-600 bg-violet-50 dark:border-violet-400 dark:bg-violet-950'
                    : 'border-base-dark/15 hover:border-violet-400 dark:hover:border-violet-500'
              "
              :disabled="!pkg.stripePriceId"
              @click="selectPackage(pkg)"
            >
              <span
                class="font-medium"
                :class="
                  selectedId === pkg.id && pkg.stripePriceId
                    ? 'text-gray-900 dark:text-gray-50'
                    : 'text-main'
                "
              >
                {{ pkg.name }}
              </span>
              <span
                class="flex shrink-0 flex-col items-end gap-0.5 text-right"
                :class="
                  selectedId === pkg.id && pkg.stripePriceId
                    ? 'text-gray-600 dark:text-violet-200/90'
                    : 'text-muted'
                "
              >
                <span>
                  {{
                    t("coins.topup_package_coins", {
                      n: pkg.coinsMinor,
                    })
                  }}
                </span>
                <span v-if="!pkg.stripePriceId" class="text-xs font-normal">
                  {{ t("coins.topup_mobile_only") }}
                </span>
              </span>
            </button>
          </li>
        </ul>

        <div class="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="text-muted hover:text-main rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="checkoutLoading || props.loading"
            @click="onBackdrop"
          >
            {{ t("coins.topup_cancel") }}
          </button>
          <button
            type="button"
            class="bg-violet-600 hover:bg-violet-700 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="
              !selectedId ||
              checkoutLoading ||
              props.loading ||
              !webPackages.length
            "
            @click="onCheckout"
          >
            {{
              checkoutLoading
                ? t("coins.topup_checkout_loading")
                : t("coins.topup_pay")
            }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
