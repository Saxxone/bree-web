<script setup lang="ts">
import { type Post } from "~/types/post";

interface Props {
  post: Post;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="bg-white rounded-lg p-3 mb-6">
    <PostsSocialPostTop img="/images/profile.jpg" />

    <AppSpacerY size="xxs" />

    <PostsSocialPostImgae v-if="props.post.img" :img="props.post?.img" />

    <PostsSocialPostText v-if="props.post.text" :text="props.post.text" />

    <PostsSocialPostActions :post="post" />
  </div>
</template>
