<script setup lang="ts">
import type { Post } from "~/types/post";
import type { Author } from "~/types/user";
import app_routes from "~/utils/routes";

interface Props {
  post: Post;
  actions?: boolean;
  truncate?: boolean;
  isFetching?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  actions: true,
  truncate: false,
});
</script>

<template>
  <div>
    <SkeletonsPostSkeleton v-if="isFetching" />

    <NuxtLink
      v-else
      class="bg-base-white mb-2 block cursor-pointer rounded-lg p-3"
      :to="app_routes.post.view(props.post.id)"
    >
      <PostsSocialPostTop
        :author="props.post.author as Author"
        :comment="props.post.parentId ? true : false"
      />

      <div
        v-if="
          props.post.type === 'LONG' && props.post.longPost?.content?.length
        "
        class="flex snap-x space-x-4 overflow-x-auto"
      >
        <div
          v-for="(long_post, index) in props.post.longPost.content"
          :key="index + '-long-post' + props.post.longPost.id"
          class="w-full shrink-0 snap-start"
        >
          <PostsSocialDisplayPostMedia
            :media="long_post.media as string[]"
            :media-types="long_post.mediaTypes"
            :post-id="props.post.id"
          />
          <PostsSocialPostText
            :id="post.id"
            :show-all="props.truncate"
            :text="long_post.text as string"
          />
        </div>
      </div>

      <div v-else>
        <div v-if="props.post.media.length && props.post.mediaTypes.length">
          <PostsSocialDisplayPostMedia
            :media="props.post.media as string[]"
            :media-types="props.post.mediaTypes"
            :post-id="props.post.id"
          />
        </div>

        <PostsSocialPostText
          v-if="props.post.text"
          :id="post.id"
          :show-all="props.truncate"
          :text="props.post.text"
        />
      </div>

      <PostsSocialPostActions v-if="props.actions" :post="post" />
    </NuxtLink>
  </div>
</template>
