<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface Props {
  message: string;
  icon?: string | null;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="flex h-96 flex-col items-center justify-center text-center">
    <div>
      <Icon
        :icon="props.icon || 'line-md:file-minus-twotone'"
        class="text-main mx-auto text-6xl"
      />
    </div>
    <div>
      <p class="text-main">{{ props.message }}</p>
    </div>
  </div>
</template>
