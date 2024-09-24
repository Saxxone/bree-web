<script lang="ts" setup>
import { usePostsStore } from "~/store/posts";

definePageMeta({
  layout: "social",
});

const postsStore = usePostsStore();

async function getFeed() {
  await postsStore.getFeed();
}

onMounted(async () => {
  getFeed();
});
</script>

<template>
  <div>
    <PostsSocialPost
      v-for="post in postsStore.feed"
      :key="post.id"
      :post="post"
    />
    <PostsStartPost />
  </div>
</template>
