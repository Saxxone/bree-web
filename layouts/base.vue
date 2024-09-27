<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";

const globalStore = useGlobalStore();
</script>

<template>
  <main class="bg-gray-100 py-6 min-h-screen">
    <div class="container pb-24">
      <div class="flex space-x-4 items-center mb-4">
        <AppGoBack />

        <h2 class="font-medium text-gray-600">
          {{ globalStore.page_name }}
        </h2>
      </div>
      <slot />
    </div>
  </main>
</template>
