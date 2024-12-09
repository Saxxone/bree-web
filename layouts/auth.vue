<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);

useHead({
  title: page_title,
});
</script>

<template>
  <main class="bg-base-light py-6 lg:py-0 min-h-dvh">
    <div class="container">
      <div class="lg:grid grid-cols-12 lg:gap-4">
        <AppLeftSideBar />
        <div
          class="col-span-6 px-4 lg:py-6 relative lg:border-x-2 lg:border-gray-700"
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
