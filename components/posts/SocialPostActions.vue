<script lang="ts" setup>
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";

interface Props {
  post: Partial<Post>;
}

const props = defineProps<Props>();
const postStore = usePostsStore();

const actions = ref([
  {
    icon: "favorite",
    count: 0,
    active: false,
    command: likePost,
  },
  {
    icon: "comment",
    count: 0,
    active: false,
    command: sharePost,
  },
  {
    icon: "share",
    count: 0,
    active: false,
    command: sharePost,
  },
  {
    icon: "bookmark",
    count: 0,
    active: false,
    command: bookmarkPost,
  },
]);

async function likePost() {
  await postStore.likePost(props.post.id as string);
}

async function bookmarkPost() {
  await postStore.bookmarkPost(props.post.id as string);
}

async function sharePost() {
  await postStore.sharePost(props.post);
}
</script>

<template>
  <div class="flex items-center pt-2 pb-2">
    <div
      @click="actions[index].command()"
      v-for="(item, index) in actions"
      :key="item.icon"
      class="flex items-center space-x-1"
      :class="[index === actions.length - 1 ? 'ml-auto' : 'mr-4']">
      <span class="material-symbols-rounded filled font-3xl text-gray-500">{{ item.icon }}</span>
      <span>{{ item.count }}</span>
    </div>
  </div>
</template>
