<script setup lang="ts">
import type { Snack } from "~/types/types";

interface Props {
  snack: Snack;
}

const props = defineProps<Props>();

const emit = defineEmits(["close"]);

onMounted(() => {
  setTimeout(() => {
    emit("close");
  }, 5000);
});
</script>

<template>
  <div
    class="fixed flex top-2 shadow-sm w-96 mx-auto z-50 rounded-lg p-4"
    :class="{
      'bg-green-100 text-green-400': props.snack.type === 'success',
      'bg-red-100 text-red-500': props.snack.type === 'error',
      'bg-yellow-100 text-yellow-400': props.snack.type === 'warning',
      'bg-blue-100 text-blue-400': props.snack.type === 'info',
    }">
    <div class="align-center">
      <div>{{ props.snack.title }}</div>
      <div>{{ props.snack.message }}</div>
    </div>
    <div class="px-2 ms-auto" @click="$emit('close')">
      <span class="material-symbols-rounded text-2xl"> close </span>
    </div>
  </div>
</template>
