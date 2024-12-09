<script setup lang="ts">
import type { Snack } from "~/types/types";
import { Icon } from "@iconify/vue";

interface Props {
  snack: Snack;
}

const props = defineProps<Props>();

const emit = defineEmits(["close"]);

let timeout: NodeJS.Timeout | number = 0;

onMounted(() => {
  timeout = setTimeout(() => {
    emit("close");
  }, props.snack.timeout ?? 3000);
});

onBeforeUnmount(() => {
  clearTimeout(timeout);
});
</script>

<template>
  <div
    class="fixed flex top-2 shadow-sm right-6 max-w-sm mx-auto z-50 rounded-lg p-4"
    :class="{
      'bg-green-100 text-green-400': props.snack.type === 'success',
      'bg-red-100 text-red-500': props.snack.type === 'error',
      'bg-yellow-100 text-yellow-400': props.snack.type === 'warning',
      'bg-blue-50 text-blue-500': props.snack.type === 'info',
    }"
  >
    <div class="align-center">
      <div>{{ props.snack.title || "" }}</div>
      <div>{{ props.snack.message || "" }}</div>
    </div>
    <div class="px-2 ms-auto" @click="$emit('close')">
      <Icon class="text-2xl" icon="line-md:close-small" />
    </div>
  </div>
</template>
