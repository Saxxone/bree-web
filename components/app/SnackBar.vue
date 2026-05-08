<script setup lang="ts">
import type { Snack } from "~/types/types";
import { Icon } from "@iconify/vue";

interface Props {
  snack: Snack;
}

const props = defineProps<Props>();

const emit = defineEmits(["close"]);

const DEFAULT_SNACK_MS = 5000;
let timeout: ReturnType<typeof setTimeout> | 0 = 0;

function scheduleClose() {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    emit("close");
  }, props.snack.timeout ?? DEFAULT_SNACK_MS);
}

onMounted(() => {
  scheduleClose();
});

watch(
  () => props.snack.timeout,
  () => scheduleClose(),
);

onBeforeUnmount(() => {
  if (timeout) clearTimeout(timeout);
});
</script>

<template>
  <div
    class="flex w-full max-w-sm rounded-lg p-4 shadow-sm bg-opacity-80 backdrop-blur-sm"
    :class="{
      'bg-green-100 text-green-400 dark:bg-green-900 dark:text-green-300':
        props.snack.type === 'success',
      'bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300':
        props.snack.type === 'error',
      'bg-yellow-100 text-yellow-400 dark:bg-yellow-900 dark:text-yellow-300':
        props.snack.type === 'warning',
      'bg-blue-50 text-blue-500 dark:bg-blue-900 dark:text-blue-300':
        props.snack.type === 'info',
    }"
  >
    <div class="align-center">
      <div>{{ props.snack.title || "" }}</div>
      <div>{{ props.snack.message || "" }}</div>
    </div>
    <div class="ms-auto px-2" @click="$emit('close')">
      <Icon class="text-2xl" icon="line-md:close-small" />
    </div>
  </div>
</template>
