<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";
import { useAuthStore } from "~/store/auth";

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

useHead({
  title: page_title,
});
</script>

<template>
  <main class="bg-base-light h-dvh overflow-y-hidden">
    <div class="container">
      <div class="grid-cols-12 lg:grid lg:gap-4">
        <AppLeftSideBar />
        <section
          class="scroll-bar-none relative col-span-6 h-dvh px-3 py-6 lg:border-x-2 lg:border-gray-700 lg:px-4"
        >
          <div
            class="fixed top-0 mb-4 flex h-20 w-full items-center space-x-4 bg-blend-color-burn"
          >
            <AppGoBack />

            <h2 class="text-main font-medium">
              {{ page_title }}
            </h2>
          </div>
          <div v-if="!user.publicKey">
            <AppSpacerY size="md" />
            <ProfileAccountSetup />
            <AppSpacerY size="md" />
          </div>
          <div v-else>
            <div size="md" class="pt-14 lg:pt-0" />
            <slot />
            <AppSpacerY size="md" />
          </div>
        </section>

        <AppRightSideBar />
      </div>
    </div>
  </main>
</template>
