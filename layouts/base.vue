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
    <div class="container">
      <div class="lg:grid grid-cols-12 lg:gap-4">
        <AppLeftSideBar />
        <section
          class="col-span-6 lg:px-4 relative lg:border-x-2 overflow-y-scroll lg:border-gray-700 scroll-bar-none px-3 h-dvh"
        >
          <!-- Top Bar start -->
          <div
            class="flex space-x-4 bg-blend-color-burn items-center top-0 fixed h-20 w-full mb-4"
          >
            <AppGoBack />

            <h2 class="font-medium text-main">
              {{ page_title }}
            </h2>
          </div>
          <!-- Top Bar End -->

          <div class="py-20 lg:pt-0">
            <slot />
          </div>
        </section>

        <AppRightSideBar />
      </div>
    </div>
  </main>
</template>
