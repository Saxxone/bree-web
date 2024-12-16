<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { useAuthStore } from "~/store/auth";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
</script>

<template>
  <div class="bg-base-white absolute top-0 w-full left-0 z-50">
    <div class="flex items-center p-4">
      <div
        class="h-10 w-14 flex mr-2 items-center justify-center lg:hidden bg-base-light rounded-full cursor-pointer"
        @click.prevent.stop="goToProfile(user.username as string)"
      >
        <Icon icon="line-md:person-twotone" class="text-2xl" />
      </div>

      <div id="top-bar" class="w-full mx-4" />

      <div class="px-2 cursor-pointer">
        <Icon icon="ic:twotone-more-vert" class="text-2xl" />
      </div>
    </div>
  </div>
</template>
