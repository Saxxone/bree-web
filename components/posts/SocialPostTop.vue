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
        width="50"
        height="50"
        class="avatar"
        :src="props.author?.img"
        :placeholder="
          img(props.author?.img, { h: 50, w: 50, f: 'png', blur: 2, q: 50 })
        "
      />
      <AppSpacerX size="xs" />
      <h6>{{ props.author?.name }}</h6>
    </div>
  </div>
</template>
