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
        :placeholder="
          img(props.author?.img as string, {
            h: 40,
            w: 40,
            f: 'png',
            blur: 2,
            q: 50,
          })
        "
        @click.prevent.stop="goToProfile(props.author.id as string)"
      />

      <h6
        class="ml-2 text-main hover:underline inline-block font-medium text-ellipsis overflow-hidden max-w-50 h-6"
        @click.prevent.stop="goToProfile(props.author.id as string)"
      >
        {{ props.author?.name }}
      </h6>

      <span
        v-if="props.author.verified"
        class="material-symbols-rounded filled ml-2 text-purple-700"
      >
        verified
      </span>
    </div>
  </div>
</template>
