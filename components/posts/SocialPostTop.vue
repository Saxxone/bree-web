<script lang="ts" setup>
import type { Author } from "~/types/user";
import { Icon } from "@iconify/vue";
import app_routes from "~/utils/routes";

interface Props {
  author: Author;
  comment: boolean;
}

const props = defineProps<Props>();
const img = useImage();
</script>

<template>
  <div>
    <Icon
      class="block mb-1 text-muted"
      v-if="props.comment"
      icon="ic:round-reply"
    />
    <div class="inline-flex items-center">
      <NuxtLink
        :to="app_routes.post.view(props.author.id)"
        class="flex items-center"
      >
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
      </NuxtLink>

      <Icon
        icon="ic:twotone-verified"
        v-if="props.author.verified"
        class="ml-2 text-purple-700"
      />
    </div>
  </div>
</template>
