<script lang="ts" setup>
import type { Author } from "~/types/user";
import { Icon } from "@iconify/vue";
import app_routes from "~/utils/routes";

interface Props {
  author: Author;
  comment: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <div>
    <Icon
      v-if="props.comment"
      class="text-muted mb-1 block"
      icon="ic:round-reply"
    />
    <div class="inline-flex items-center">
      <NuxtLink
        :to="app_routes.profile.view(encodeURIComponent(props.author.username))"
        class="flex items-center"
      >
        <AppUserAvatar
          :src="props.author?.img"
          :alt="props.author.name"
          :width="40"
          :height="40"
          img-class="avatar"
        />

        <NuxtLink
          :to="
            app_routes.profile.view(encodeURIComponent(props.author.username))
          "
          class="text-main max-w-50 ml-2 inline-block h-12 overflow-hidden text-ellipsis font-medium hover:underline"
        >
          <div>{{ props.author?.name }}</div>
          <div class="text-muted text-sm">@{{ props.author?.username }}</div>
        </NuxtLink>
      </NuxtLink>

      <Icon
        v-if="props.author.verified"
        icon="ic:twotone-verified"
        class="ml-2 text-purple-700"
      />
    </div>
  </div>
</template>
