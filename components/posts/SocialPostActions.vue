<script lang="ts" setup>
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
    icon: "favorite",
    key: "likeCount",
    active: props.post?.likedByMe,
    command: likePost,
  },
  {
    icon: "comment",
    key: "commentCount",
    active: false,
    command: comment,
  },
  {
    icon: "share",
    active: false,
    command: sharePost,
  },
  {
    icon: "bookmark",
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
  postStore.current_post = props.post;
  router.push({ path: app_routes.post.compose, query: { comment: 1, id: props.post.id } });
}
</script>

<template>
  <div class="flex items-center pt-2 pb-2">
    <div
      @click="actions[index].command()"
      v-for="(item, index) in actions"
      :key="item.icon"
      class="flex items-center space-x-1"
      :class="[
        index === actions.length - 2 ? 'ml-auto' : 'mr-4',
        {
          'text-purple-500': item.active,
          'text-red-500': item.active && item.key === 'likeCount',
        },
      ]">
      <span
        class="material-symbols-rounded filled"
        :class="[
          item.active ? 'text-purple-500' : 'text-gray-500',
          {
            'text-red-500': item.active && item.key === 'likeCount',
          },
        ]"
        >{{ item.icon }}</span
      >
      <span>{{ post[item.key as keyof Post] }}</span>
    </div>
  </div>
</template>
