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
      <AppTopBar class="lg:hidden" />

      <div class="lg:grid grid-cols-12 lg:gap-4">
        <AppLeftSideBar />
        <section
          class="col-span-6 py-6 lg:py-0 overflow-y-scroll scroll-bar-none h-dvh relative"
        >
          <slot />
          <PostsStartPost />
        </section>

        <AppRightSideBar />
      </div>
    </div>

    <AppBottomBar class="fixed bottom-0 lg:hidden" />
  </main>
</template>
