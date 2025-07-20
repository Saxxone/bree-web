<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);

useHead({
  title: page_title,
});
</script>

<template>
  <main class="bg-base-light min-h-dvh py-6 lg:py-0">
    <div class="container">
      <div class="grid-cols-12 lg:grid lg:gap-4">
        <AppLeftSideBar />
        <div
          class="relative col-span-6 px-4 lg:border-x-2 lg:border-gray-700 lg:py-6"
        >
          <AppGoBack />

          <AppSpacerY size="lg" />
          <slot />
        </div>

        <AppRightSideBar />
      </div>
    </div>
  </main>
</template>
