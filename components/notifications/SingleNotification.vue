<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import type { Notification } from "~/types/notification";
import type { Author } from "~/types/user";

interface Props {
  author: Author;
  notification: Notification;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="bg-base-white mb-4 rounded-lg p-4">
    <div
      class="flex items-start space-x-4"
      @click.prevent.stop="goToProfile(props.author.username as string)"
    >
      <AppUserAvatar
        :src="props.author?.img"
        :alt="props.author.name"
        :width="40"
        :height="40"
        img-class="avatar"
      />

      <h6
        class="text-main max-w-50 ml-2 h-6 overflow-hidden text-ellipsis font-medium hover:underline"
      >
        {{ props.author?.name }}
      </h6>

      <Icon
        v-if="props.author.verified"
        icon="ic:twotone-verified"
        class="mt-1 text-purple-700"
      />
    </div>
    <div>
      <p>{{ notification.description }}</p>
      <pre>{{ notification }}</pre>
    </div>
  </div>
</template>
