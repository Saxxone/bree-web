<script lang="ts" setup>
import { useAuthStore } from "~/store/auth";

const authStore = useAuthStore();
</script>

<template>
  <div class="bg-white fixed top-0 w-full left-0 z-50">
    <div class="flex justify-between items-center p-4">
      <div @click.prevent.stop="goToProfile(authStore.user.id as string)" class="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer">
        <span class="material-symbols-rounded text-2xl"> person </span>
      </div>

      <div class="px-2 cursor-pointer">
        <span class="material-symbols-rounded text-2xl"> more_vert </span>
      </div>
    </div>
  </div>
</template>
