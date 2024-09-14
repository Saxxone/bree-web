<script setup lang="ts">
import type { Snack } from "~/types/types";

interface Props {
  snack: Snack;
}

const props = defineProps<Props>();

const emit = defineEmits(["close"]);
</script>

<template>
  <div
    class="fixed flex top-2 shadow-sm w-96 mx-auto z-50 rounded-md p-4"
    :class="{
      'bg-green-100 text-green-400': props.snack.type === 'success',
      'bg-red-100 text-red-500': props.snack.type === 'error',
      'bg-yellow-100 text-yellow-400': props.snack.type === 'warning',
      'bg-blue-100 text-blue-400': props.snack.type === 'info',
    }"
  >
    <div>
      <div>{{ props.snack.title }}</div>
      <div>{{ props.snack.message }}
      </div>
    </div>
    <div class="p-2 ml-auto" @click="$emit('close')">
      <span class="material-symbols-rounded font-5xl"> close </span>
    </div>
  </div>
</template>
