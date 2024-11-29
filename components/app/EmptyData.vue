<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface Props {
  message: string;
  icon: string | null | undefined;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="text-center h-96 flex flex-col items-center justify-center">
    <div>
      <Icon
        :icon="props.icon || 'line-md:file-minus-twotone'"
        class="text-6xl text-main mx-auto"
      />
    </div>
    <div>
      <p class="text-main">{{ props.message }}</p>
    </div>
  </div>
</template>
