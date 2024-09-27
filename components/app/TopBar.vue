<script lang="ts" setup>
import app_routes from "~/utils/routes";
import { useAuthStore } from "~/store/auth";

const authStore = useAuthStore();
</script>

<template>
  <div class="bg-white fixed top-0 w-full left-0 z-50">
    <div class="flex justify-between items-center p-4">
      <NuxtLink :to="app_routes.profile(authStore.user?.id as string)" class="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer">
        <span class="material-symbols-rounded"> person </span>
      </NuxtLink>

      <div class="px-2 cursor-pointer">
        <span class="material-symbols-rounded"> more_vert </span>
      </div>
    </div>
  </div>
</template>
