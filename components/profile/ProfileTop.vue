<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { useAuthStore } from "~/store/auth";
import { isApiError, useCoinsStore } from "~/store/coins";
import type { User } from "~/types/user";
import app_routes from "~/utils/routes";

interface Props {
  u: User;
}

const props = defineProps<Props>();
const authStore = useAuthStore();
const { user, isAuthenticated } = storeToRefs(authStore);
const coinsStore = useCoinsStore();
const { balanceMinor } = storeToRefs(coinsStore);
const { t } = useI18n();

const isSameUser = computed(() => user.value?.id === props.u.id);
const showWallet = computed(() => isSameUser.value && isAuthenticated.value);

const topUpOpen = ref(false);
const walletLoading = ref(false);

async function refreshWallet() {
  if (!showWallet.value) return;
  walletLoading.value = true;
  try {
    const res = await coinsStore.fetchBalance();
    if (isApiError(res)) {
      balanceMinor.value = null;
    }
  } finally {
    walletLoading.value = false;
  }
}

onMounted(() => {
  if (import.meta.client) {
    refreshWallet();
  }
});

watch(showWallet, (v) => {
  if (v && import.meta.client) refreshWallet();
});
</script>

<template>
  <div v-if="props.u">
    <div class="">
      <div class="flex items-center justify-end py-3 gap-3">
        <AppUserAvatar
          :src="props.u?.img"
          :alt="props.u.name"
          :width="100"
          :height="100"
          img-class="avatar border-2 border-violet-900"
        />
        <div>
          <div class="mb-1 flex items-center">
            <h1 class="text-main mb-0 text-2xl font-medium leading-none">
              {{ props.u.name }}
            </h1>
            <Icon
              icon="ic:twotone-verified"
              class="ml-2 mt-1 text-2xl text-violet-700"
            />
          </div>

          <div v-if="isSameUser">
            <div class="flex items-center gap-1">
              <div class="text-sub text-sm">@{{ props.u.username }}</div>
              <NuxtLink :to="app_routes.profile.edit" class="text-white">
                <Icon icon="ic:twotone-edit" class="" />
              </NuxtLink>
            </div>

            <div
              v-if="showWallet"
              class="flex items-center justify-between gap-2"
            >
              <div class="flex items-center gap-1 text-muted">
                <IconsLineCoins
                  :size="16"
                  class="text-muted shrink-0"
                  aria-hidden="true"
                />
                <span class="text-main text-sm font-medium">
                  <template v-if="walletLoading && balanceMinor == null">
                    {{ t("profile.wallet_balance_loading") }}
                  </template>
                  <template v-else-if="balanceMinor != null">
                    {{ balanceMinor }}
                  </template>
                  <template v-else>
                    {{ t("profile.wallet_balance_unavailable") }}
                  </template>
                </span>
              </div>

              <button
                type="button"
                class="bg-transparent rounded-lg px-2 py-1 text-sm font-medium text-violet-600"
                @click="topUpOpen = true"
              >
                {{ t("profile.wallet_topup") }}
              </button>
            </div>
          </div>

          <button
            v-if="!isSameUser"
            class="rounded-3xl bg-violet-700 px-6 py-2 mt-2 -ml-1 font-medium capitalize text-white"
          >
            {{ t("profile.follow") }}
          </button>
        </div>
      </div>
    </div>

    <AppCoinTopUpModal
      v-model="topUpOpen"
      :resume="{ profileUserId: props.u.id }"
    />

    <p v-if="props.u.bio" class="text-sub py-4 text-sm">
      {{ props.u.bio }}
    </p>
  </div>
</template>
