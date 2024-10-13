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
    <div class="container pt-14 lg:py-0">
      <div class="lg:grid grid-cols-12 lg:gap-4">
        <section class="col-span-3">
          <AppLeftSideBar />
        </section>
        <section class="col-span-6">
          <slot />
        </section>
        <section class="col-span-3">
          <AppRightSideBar />
        </section>
      </div>
    </div>
  </main>
</template>
