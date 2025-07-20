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
      <div class="grid-cols-12 lg:grid lg:gap-4">
        <AppLeftSideBar />
        <section
          class="relative col-span-6 lg:border-x-2 lg:border-gray-700 lg:px-4"
        >
          <AppTopBar />
          <div class="scroll-bar-none h-dvh overflow-y-scroll px-3 lg:px-0">
            <div class="py-10" />
            <slot />
            <AppSpacerY size="md" />
          </div>
          <AppFloatingActionButton
            v-if="$route.path === app_routes.home"
            icon="line-md:edit-full-twotone"
            :to="app_routes.post.compose"
          />
        </section>

        <AppRightSideBar />
      </div>
    </div>

    <AppBottomBar class="fixed bottom-0 lg:hidden" />
  </main>
</template>
