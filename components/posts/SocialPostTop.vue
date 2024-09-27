<script lang="ts" setup>
import type { Author } from "~/types/user";

interface Props {
  author: Author;
}

const props = defineProps<Props>();
const img = useImage();
</script>

<template>
  <div>
    <div class="flex items-center">
      <NuxtImg
        width="40"
        height="40"
        class="avatar"
        :src="props.author?.img"
        :alt="props.author.name"
        @click.prevent.stop="goToProfile(props.author.id as string)"
        :placeholder="img(props.author?.img as string, { h: 40, w: 40, f: 'png', blur: 2, q: 50 })" />

      <h6 class="ml-2 text-gray-700 font-medium text-ellipsis overflow-hidden max-w-50 h-6">
        {{ props.author?.name }}
      </h6>
    </div>
  </div>
</template>
