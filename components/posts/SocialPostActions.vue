<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import app_routes from "~/utils/routes";

interface Props {
  post: Post;
}

const props = defineProps<Props>();
const postStore = usePostsStore();
const router = useRouter();

const actions = computed(() => [
  {
    icon: "line-md:heart",
    key: "likeCount",
    active: props.post?.likedByMe,
    command: likePost,
  },
  {
    icon: "ic:round-reply-all",
    key: "commentCount",
    active: false,
    command: comment,
  },
  {
    icon: "ic:twotone-share",
    active: false,
    command: sharePost,
  },
  {
    icon: "ic:twotone-bookmarks",
    key: "bookmarkCount",
    active: props.post?.bookmarkedByMe,
    command: bookmarkPost,
  },
]);

async function likePost() {
  await postStore.likePost(props.post, !props.post?.likedByMe);
}

async function bookmarkPost() {
  await postStore.bookmarkPost(props.post, !props.post?.bookmarkedByMe);
}

function sharePost() {
  postStore.sharePost(props.post);
}

function comment() {
  router.push({
    path: app_routes.post.compose,
    query: { comment: 1, id: props.post.id },
  });
}
</script>

<template>
  <div class="flex items-center pb-2 pt-2">
    <div
      v-for="(item, index) in actions"
      :key="item.icon + post.id"
      class="flex cursor-pointer items-center space-x-1"
      :class="[
        index === actions.length - 2 ? 'ms-auto' : 'mr-4',
        {
          'text-purple-500': item.active && item.key !== 'likeCount',
          'text-red-500': item.active && item.key === 'likeCount',
        },
      ]"
      @click.prevent.stop="actions[index].command()"
    >
      <Icon
        :key="item.active ? item.icon + '-active' : item.icon"
        :icon="
          item.active && item.key === 'likeCount'
            ? 'line-md:heart-filled'
            : item.icon
        "
        :class="[
          {
            'text-red-500': item.active && item.key === 'likeCount',
            'text-purple-500': item.active && item.key !== 'likeCount',
            'text-sub': !item.active,
          },
        ]"
      />

      <span class="text-sub text-sm font-light">{{
        post[item.key as keyof Post]
      }}</span>
    </div>
  </div>
</template>
