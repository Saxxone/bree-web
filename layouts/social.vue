<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";
import app_routes from "~/utils/routes";
import { socialMainScrollElKey } from "~/utils/socialMainScrollEl";

const route = useRoute();
const isExploreSearchShell = computed(() => route.path === app_routes.explore);
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);

const mainScrollEl = ref<HTMLElement | null>(null);
provide(socialMainScrollElKey, mainScrollEl);

useHead({
  title: page_title,
});
</script>

<template>
  <main
    :class="[
      'h-dvh overflow-y-hidden',
      isExploreSearchShell ? 'bg-[#1e2530]' : 'bg-base-light',
    ]"
  >
    <div class="container">
      <div class="grid-cols-12 lg:grid lg:gap-4">
        <AppLeftSideBar />
        <section
          :class="[
            'relative col-span-6 lg:border-x-2 lg:px-4',
            isExploreSearchShell ? 'lg:border-white/10' : 'lg:border-gray-700',
          ]"
        >
          <AppTopBar />
          <div
            ref="mainScrollEl"
            class="scroll-bar-none h-dvh overflow-y-scroll px-3 lg:px-0 [overflow-anchor:none]"
          >
            <div class="py-10" />
            <slot />
            <AppSpacerY size="md" />
          </div>
          <AppHomeComposeSpeedDial v-if="$route.path === app_routes.home" />
        </section>

        <AppRightSideBar />
      </div>
    </div>

    <AppBottomBar class="fixed bottom-0 lg:hidden" />
  </main>
</template>
