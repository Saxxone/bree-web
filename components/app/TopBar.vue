<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { useAuthStore } from "~/store/auth";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
</script>

<template>
  <div class="bg-base-white absolute left-0 top-0 z-50 w-full">
    <div class="flex items-center p-4">
      <div
        class="bg-base-light mr-2 flex h-10 w-14 cursor-pointer items-center justify-center rounded-full lg:hidden"
        @click.prevent.stop="goToProfile(user.username as string)"
      >
        <Icon icon="line-md:person-twotone" class="text-2xl" />
      </div>

      <div id="top-bar" class="mx-4 w-full" />

      <div class="cursor-pointer px-2">
        <Icon icon="ic:twotone-more-vert" class="text-2xl" />
      </div>
    </div>
  </div>
</template>
