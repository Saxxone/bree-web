<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);

useHead({
  title: page_title,
});
</script>

<template>
  <main class="bg-base-light scroll-bar-none h-dvh overflow-y-scroll">
    <div class="container">
      <div class="grid-cols-12 lg:grid lg:gap-4">
        <AppLeftSideBar />
        <section
          class="relative col-span-6 px-3 lg:border-x-2 lg:border-gray-700 lg:px-4"
        >
          <slot />
        </section>

        <AppRightSideBar />
      </div>
    </div>
  </main>
</template>
