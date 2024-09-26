<script setup lang="ts">
import app_routes from "~/utils/routes";
import type { MediaType, Post } from "~/types/post";
import { goToPost } from "~/composables/usePost";

interface Props {
  post: Post;
  actions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  actions: true,
});
</script>

<template>
  <div class="bg-white rounded-lg p-3 mb-2 cursor-pointer">
    <div @click="goToPost(props.post)" :to="app_routes.post.view(props.post.id)">
      <PostsSocialPostTop :author="props.post.author" />

      <div v-if="props.post.media && props.post.mediaTypes">
        <PostsSocialDisplayPostMedia :post="props.post" />
      </div>

      <PostsSocialPostText v-if="props.post.text" :text="props.post.text" />
    </div>
    <PostsSocialPostActions v-if="props.actions" :post="post" />
  </div>
</template>
