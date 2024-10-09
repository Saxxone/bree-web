<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";

const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);

useHead({
  title: page_title,
});
</script>

<template>
  <main class="bg-light py-6 min-h-screen">
    <div class="container pt-14 pb-24 lg:py-0">
      <div class="lg:grid grid-cols-12 gap-4">
        <section class="col-span-3">
          <AppLeftSideBar />
        </section>
        <section class="col-span-6">
          <div class="flex space-x-4 items-center top-0 fixed h-20 w-full mb-4">
            <AppGoBack />

            <h2 class="font-medium text-main">
              {{ page_title }}
            </h2>
          </div>
          <slot />
        </section>
        <section class="col-span-3">
          <AppRightSideBar />
        </section>
      </div>
    </div>
  </main>
</template>
