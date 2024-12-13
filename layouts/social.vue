<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";
import app_routes from "~/utils/routes";

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
          class="col-span-6 lg:px-4 relative lg:border-x-2 lg:border-gray-700"
        >
          <AppTopBar />
          <div class="overflow-y-scroll scroll-bar-none px-3 lg:px-0 h-dvh">
            <div class="py-10" />
            <slot />
            <AppSpacerY size="md" />
          </div>
          <PostsStartPost v-if="$route.path === app_routes.home" />
        </section>

        <AppRightSideBar />
      </div>
    </div>

    <AppBottomBar class="fixed bottom-0 lg:hidden" />
  </main>
</template>
