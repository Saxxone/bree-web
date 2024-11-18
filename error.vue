<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});
</script>

<template>
  <div class="flex items-center flex-col justify-center min-h-dvh text-purple-700">
    <h1 class="text-main">{{ error?.status }}</h1>
    <NuxtLink to="/">Go back home</NuxtLink>
  </div>
</template>
