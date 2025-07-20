<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface Props {
  icon: string;
  to: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="absolute bottom-32 right-3 z-50">
    <NuxtLink
      :to="to"
      class="right-0 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 p-4 text-white shadow-xl"
    >
      <Icon :icon="props.icon" class="text-2xl" />
    </NuxtLink>
  </div>
</template>
