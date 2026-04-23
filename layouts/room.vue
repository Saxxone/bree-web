<script lang="ts" setup>
import { useAuthStore } from "~/store/auth";
import { useCryptoStore } from "~/store/crypto";
import { useGlobalStore } from "~/store/global";
import app_routes from "~/utils/routes";

const route = useRoute();
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const cryptoStore = useCryptoStore();
const { isRegistered } = storeToRefs(cryptoStore);

// Kick off worker init as soon as the messaging layout mounts so that by the
// time the room view asks to decrypt, the Olm account is already loaded.
onMounted(() => {
  if (!user.value?.id) return;
  void cryptoStore.init();
});

const needsEncryption = computed(() => !!user.value?.id && !isRegistered.value);
const isSearchShell = computed(() => route.path === app_routes.messages.new);

useHead({
  title: page_title,
});
</script>

<template>
  <main
    :class="[
      'h-dvh pt-12 overflow-y-hidden',
      isSearchShell ? 'bg-[#1e2530]' : 'bg-base-light',
    ]"
  >
    <div class="container">
      <div class="grid-cols-12 lg:grid lg:gap-4">
        <AppLeftSideBar />
        <section
          :class="[
            'scroll-bar-none relative col-span-6 h-dvh px-3 py-6 lg:border-x-2 lg:px-4',
            isSearchShell ? 'lg:border-white/10' : 'lg:border-gray-700',
          ]"
        >
          <div
            :class="[
              'fixed top-0 z-20 mb-4 flex h-20 w-full max-w-full items-center space-x-3 px-0',
              isSearchShell ? 'bg-[#1e2530]' : 'bg-blend-color-burn',
            ]"
          >
            <AppGoBack :tone="isSearchShell ? 'search' : 'default'" />

            <h2
              :class="[
                'min-w-0 font-semibold',
                isSearchShell ? 'text-lg text-white' : 'text-main font-medium',
              ]"
            >
              {{ page_title }}
            </h2>
          </div>
          <ClientOnly>
            <template v-if="needsEncryption">
              <AppSpacerY size="md" />
              <ProfileAccountSetup />
              <AppSpacerY size="md" />
            </template>
            <template v-else>
              <slot />
              <AppSpacerY size="md" />
            </template>
            <template #fallback>
              <div class="pt-14 lg:pt-10" />
              <!--
                During SSR we don't know whether the user still needs to
                finish E2EE setup (that check reads `localStorage`). Render a
                neutral placeholder instead of the slot so the chat view
                doesn't flash before the encryption gate shows on hydration.
              -->
              <div class="animate-pulse space-y-3 py-6">
                <div class="bg-slate-200 dark:bg-slate-700 h-4 w-2/3 rounded" />
                <div class="bg-slate-200 dark:bg-slate-700 h-4 w-1/2 rounded" />
                <div class="bg-slate-200 dark:bg-slate-700 h-4 w-3/4 rounded" />
              </div>
              <AppSpacerY size="md" />
            </template>
          </ClientOnly>
        </section>

        <AppRightSideBar />
      </div>
    </div>
  </main>
</template>
