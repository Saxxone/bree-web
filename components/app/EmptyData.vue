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
      <IconPicker :icon="props.icon" class="text-2xl" />
    </div>
    <div>
      <p class="text-main">{{ props.message }}</p>
    </div>
  </div>
</template>
