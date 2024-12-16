<script setup lang="ts">
import { Icon } from "@iconify/vue";
import app_routes from "~/utils/routes";

interface Props {
  icon: string;
  to: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="absolute bottom-32 z-50 right-3">
    <NuxtLink
      :to="to"
      class="p-4 flex items-center right-0 justify-center bg-indigo-500 text-white shadow-xl rounded-full w-14 h-14"
    >
      <Icon :icon="icon" class="text-2xl" />
    </NuxtLink>
  </div>
</template>
