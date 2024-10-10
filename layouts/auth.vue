<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);

useHead({
  title: page_title,
});
</script>

<template>
  <main class="bg-base-light py-6 lg:py-0 min-h-screen">
    <div class="container">
      <div class="lg:grid grid-cols-12 gap-4">
        <section class="col-span-3">
          <AppLeftSideBar />
        </section>
        <div class="col-span-6">
          <AppGoBack />

          <AppSpacerY size="lg" />
          <slot />
        </div>
        <section class="col-span-3">
          <AppRightSideBar />
        </section>
      </div>
    </div>
  </main>
</template>
