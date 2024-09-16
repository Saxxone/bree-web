<script setup lang="ts">
import type { Post } from "~/types/post";
import { useRoute } from "vue-router";
import { usePostsStore } from "~/store/posts";

definePageMeta({
  layout: "social",
});

const postsStore = usePostsStore();
const route = useRoute();
const post = ref<Post>();

async function findPostById(id: string) {
  post.value = await postsStore.findPostById(id);
}

onMounted(async () => {
  findPostById(route.params.id as string);
});
</script>

<template>
  <div>
    <PostsSocialPost v-if="post?.id" :post="post" :key="post.id" />
  </div>
</template>
