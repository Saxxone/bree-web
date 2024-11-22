<script setup lang="ts">
import type { Post } from "~/types/post";
import app_routes from "~/utils/routes";

interface Props {
  post: Post;
  actions?: boolean;
  truncate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  actions: true,
  truncate: false,
});
</script>

<template>
  <div>
    <SkeletonsPostSkeleton v-if="!props.post" />

    <NuxtLink
      class="bg-base-white block rounded-lg p-3 mb-2 cursor-pointer"
      :to="app_routes.post.view(props.post.id)"
      v-else
    >
      <PostsSocialPostTop :author="props.post.author" />

      <div v-if="props.post.media.length && props.post.mediaTypes.length">
        <PostsSocialDisplayPostMedia :post="props.post" />
      </div>

      <PostsSocialPostText
        v-if="props.post.text"
        :show-all="props.truncate"
        :text="props.post.text"
      />

      <PostsSocialPostActions v-if="props.actions" :post="post" />
    </NuxtLink>
  </div>
</template>
