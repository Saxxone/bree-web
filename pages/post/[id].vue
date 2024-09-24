<script setup lang="ts">
import { useRoute } from "vue-router";
import { usePostsStore } from "~/store/posts";

definePageMeta({
  layout: "social",
});

const postsStore = usePostsStore();
const route = useRoute();

async function findPostById(id: string) {
  await postsStore.findPostById(id);
}

onMounted(async () => {
  if (!postsStore.current_post) findPostById(route.params.id as string);
});
</script>

<template>
  <div>
    <PostsSocialPost v-if="postsStore.current_post?.id" :key="postsStore.current_post.id" :post="postsStore.current_post" />
    <PostsStartPost />
  </div>
</template>
