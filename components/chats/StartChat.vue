<script setup lang="ts">
import { Icon } from "@iconify/vue";
import app_routes from "~/utils/routes";
</script>

<template>
  <div class="fixed bottom-32 z-50 right-3">
    <NuxtLink
      :to="app_routes.messages.new"
      class="p-4 flex items-center right-0 justify-center bg-indigo-500 text-white shadow-xl border-violet-400 border rounded-full w-14 h-14"
    >
      <Icon icon="line-md:edit-full-twotone" class="text-2xl" />
    </NuxtLink>
  </div>
</template>
