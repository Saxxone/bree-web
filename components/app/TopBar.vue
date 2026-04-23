<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { useAuthStore } from "~/store/auth";
import app_routes from "~/utils/routes";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const route = useRoute();
const isExploreSearchShell = computed(() => route.path === app_routes.explore);
</script>

<template>
  <div
    :class="[
      'absolute left-0 top-0 z-50 w-full',
      isExploreSearchShell
        ? 'border-b border-white/5 bg-[#1e2530]'
        : 'bg-base-white',
    ]"
  >
    <div class="flex min-w-0 items-center p-4">
      <div
        :class="[
          'mr-2 flex h-10 w-14 cursor-pointer items-center justify-center rounded-full lg:hidden',
          isExploreSearchShell ? 'bg-[#1a202c]/90' : 'bg-base-light',
        ]"
        @click.prevent.stop="goToProfile(user.username as string)"
      >
        <Icon
          icon="line-md:person-twotone"
          :class="isExploreSearchShell ? 'text-2xl text-slate-200' : 'text-2xl'"
        />
      </div>

      <div id="top-bar" class="mx-2 min-w-0 w-full max-w-full flex-1" />

      <div class="cursor-pointer px-2">
        <Icon
          icon="ic:twotone-more-vert"
          :class="isExploreSearchShell ? 'text-2xl text-slate-200' : 'text-2xl'"
        />
      </div>
    </div>
  </div>
</template>
