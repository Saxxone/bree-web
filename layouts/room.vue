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
      <div class="lg:grid grid-cols-12 lg:gap-4">
        <AppLeftSideBar />
        <section
          class="col-span-6 lg:px-4 relative lg:border-x-2 lg:border-gray-700 h-dvh px-3 py-6 scroll-bar-none"
        >
          <div
            class="flex space-x-4 bg-blend-color-burn items-center top-0 fixed h-20 w-full mb-4"
          >
            <AppGoBack />

            <h2 class="font-medium text-main">
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
