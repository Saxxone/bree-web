<script setup lang="ts">
import app_routes from "~/utils/routes";
import type { Post } from "~/types/post";
import { usePostsStore } from "~/store/posts";

interface Props {
  post: Post;
}

const props = defineProps<Props>();
const postStore = usePostsStore();
const router = useRouter();

function goToPost() {
  postStore.current_post = props.post;
  router.push(app_routes.post.view(props.post.id));
}
</script>

<template>
  <div class="bg-white rounded-lg p-3 mb-6">
    <div @click="goToPost" :to="app_routes.post.view(props.post.id)">
      <PostsSocialPostTop :author="props.post.author" />

      <PostsSocialPostImage v-if="props.post.img" :img="props.post?.img" />

      <PostsSocialPostText v-if="props.post.text" :text="props.post.text" />
    </div>
    <PostsSocialPostActions :post="post" />
  </div>
</template>
