<script setup lang="ts">
import app_routes from "~/utils/routes";
import type { Post } from "~/types/post";

interface Props {
  post: Post;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="bg-white rounded-lg p-3 mb-6">
    <NuxtLink :to="app_routes.post.view(props.post.id)">
      <PostsSocialPostTop :author="props.post.author" />

      <PostsSocialPostImage v-if="props.post.img" :img="props.post?.img" />

      <PostsSocialPostText v-if="props.post.text" :text="props.post.text" />
    </NuxtLink>
    <PostsSocialPostActions :post="post" />
  </div>
</template>
