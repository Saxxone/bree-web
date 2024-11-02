<script setup lang="ts">
interface Props {
  message: string;
  icon?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="text-center">
    <div>
      <span class="material-symbols-rounded text-2xl">{{ props.icon }}</span>
    </div>
    <div>
      <p class="text-main">{{ props.message }}</p>
    </div>
  </div>
</template>
