<script setup lang="ts">
import app_routes from "~/utils/routes";
import type { Post } from "~/types/post";

interface Props {
  post: Post;
}

const props = defineProps<Props>();
</script>

<template>
  <NuxtLink
    :to="app_routes.post.view(props.post.id)"
    class="bg-white block rounded-lg p-3 mb-6"
  >
    <PostsSocialPostTop :author="props.post.author" />

    <PostsSocialPostImage v-if="props.post.img" :img="props.post?.img" />

    <PostsSocialPostText v-if="props.post.text" :text="props.post.text" />

    <PostsSocialPostActions :post="post" />
  </NuxtLink>
</template>
