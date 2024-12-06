<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);

useHead({
  title: page_title,
});
</script>

<template>
  <main class="bg-base-light h-dvh overflow-y-hidden">
    <div class="container pt-14 lg:py-0">
      <div class="lg:grid grid-cols-12 lg:gap-4">
        <AppLeftSideBar />
        <section
          class="col-span-6 py-6 overflow-y-scroll scroll-bar-none h-dvh"
        >
          <div
            class="flex space-x-4 bg-blend-color-burn items-center top-0 fixed h-20 w-full mb-4"
          >
            <AppGoBack />

            <h2 class="font-medium text-main">
              {{ page_title }}
            </h2>
          </div>
          <slot />
        </section>

        <AppRightSideBar />
      </div>
    </div>
  </main>
</template>
