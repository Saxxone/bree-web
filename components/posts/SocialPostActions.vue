<script lang="ts" setup>
import type { Post } from "~/types/post";

interface Props {
  post: Post;
}

const props = defineProps<Props>();

const actions = ref([
  {
    icon: "favorite",
    count: 0,
    active: false,
  },
  {
    icon: "comment",
    count: 0,
    active: false,
  },
  {
    icon: "send",
    count: 0,
    active: false,
  },
  {
    icon: "bookmark",
    count: 0,
    active: false,
  },
]);
</script>

<template>
  <div class="flex items-center pt-4 pb-2">
    <div
      v-for="(item, index) in actions"
      class="flex items-center space-x-1"
      :class="[index === actions.length - 1 ? 'ml-auto' : 'mr-4']"
      :key="item.icon"
    >
      <span class="material-symbols-rounded filled font-3xl text-gray-500">{{
        item.icon
      }}</span>
      <span>{{ item.count }}</span>
    </div>
  </div>
</template>
