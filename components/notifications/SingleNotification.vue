<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import type { Notification } from "~/types/notification";
import type { Author } from "~/types/user";

interface Props {
  author?: Author;
  notification: Notification;
}

const props = defineProps<Props>();
const { t } = useI18n();

const targetPostId = computed(() => {
  const n = props.notification;
  return n.commentId || n.postId || null;
});

const canOpenPost = computed(() => Boolean(targetPostId.value));

function openProfile() {
  const username = props.author?.username;
  if (!username) return;
  goToProfile(username);
}

function onHeaderAreaClick(e: MouseEvent) {
  if (props.author?.username) {
    e.stopPropagation();
    openProfile();
  }
}

function openRelatedPost() {
  const id = targetPostId.value;
  if (!id) return;
  goToPost(id);
}

function onCardClick() {
  if (!canOpenPost.value) return;
  openRelatedPost();
}
</script>

<template>
  <div
    class="bg-base-white mb-4 rounded-lg p-4 transition-colors"
    :class="{
      'cursor-pointer hover:bg-gray-900/40': canOpenPost,
    }"
    role="article"
    @click="onCardClick"
  >
    <div
      class="flex cursor-pointer items-start space-x-4"
      :class="{ 'cursor-default': !author?.username }"
      @click="onHeaderAreaClick"
    >
      <AppUserAvatar
        v-if="author"
        :src="author.img"
        :alt="author.name"
        :width="40"
        :height="40"
        img-class="avatar"
      />
      <div
        v-else
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-light"
      >
        <Icon icon="ic:twotone-notifications" class="text-xl text-main" />
      </div>

      <h6
        v-if="author"
        class="text-main max-w-50 ml-2 h-6 overflow-hidden text-ellipsis font-medium hover:underline"
      >
        {{ author.name }}
      </h6>

      <Icon
        v-if="author?.verified"
        icon="ic:twotone-verified"
        class="mt-1 text-violet-700"
      />
    </div>
    <div class="mt-2">
      <p class="text-main text-sm leading-relaxed">
        {{ notification.description }}
      </p>
      <p
        v-if="canOpenPost"
        class="text-violet-500 mt-2 text-sm font-medium hover:underline"
      >
        {{ t("notifications.view_post") }}
      </p>
    </div>
  </div>
</template>
