<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);

useHead({
  title: page_title,
});
</script>

<template>
  <main class="bg-base-light h-dvh overflow-y-scroll scroll-bar-none">
    <div class="container">
      <div class="lg:grid grid-cols-12 lg:gap-4">
        <AppLeftSideBar />
        <section
          class="col-span-6 lg:px-4 relative lg:border-x-2 lg:border-gray-700 px-3"
        >
          <slot />
        </section>

        <AppRightSideBar />
      </div>
    </div>
  </main>
</template>
