<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import type { Notification } from "~/types/notification";
import type { Author } from "~/types/user";

interface Props {
  author: Author;
  notification: Notification;
}

const props = defineProps<Props>();
const img = useImage();
</script>

<template>
  <div>
    <div>
      <div
        class="flex items-center"
        @click.prevent.stop="goToProfile(props.author.username as string)"
      >
        <NuxtImg
          width="40"
          height="40"
          class="avatar"
          :src="props.author?.img ?? ''"
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
        />

        <h6
          class="ml-2 text-main hover:underline font-medium text-ellipsis overflow-hidden max-w-50 h-6"
        >
          {{ props.author?.name }}
        </h6>

        <Icon
          v-if="props.author.verified"
          icon="ic:twotone-verified"
          class="ml-2 text-purple-700"
        />
      </div>
    </div>
  </div>
</template>
