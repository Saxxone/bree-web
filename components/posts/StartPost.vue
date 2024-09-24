<script setup lang="ts">
import app_routes from "~/utils/routes";
</script>

<template>
  <div class="fixed bottom-32 z-50 right-3">
    <NuxtLink
      :to="app_routes.post.compose"
      class="p-4 flex items-center right-0 justify-center bg-indigo-500 text-white shadow-xl border-violet-400 border rounded-full w-20 h-20"
    >
      <span class="material-symbols-rounded">edit</span>
    </NuxtLink>
  </div>
</template>
