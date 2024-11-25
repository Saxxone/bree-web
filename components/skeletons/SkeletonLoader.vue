<script lang="ts" setup>
defineProps<{ width: string; height: string; radius: string }>();
</script>

<template>
  <div class="skeleton bg-gray-700" :class="[width, height, radius]"></div>
</template>

<style scoped lang="postcss">
.skeleton {
  animation: skeleton-loading 1s linear infinite alternate;
}

@keyframes skeleton-loading {
  0% {
    @apply bg-gray-700;
  }
  100% {
    @apply bg-gray-600;
  }
}
</style>
