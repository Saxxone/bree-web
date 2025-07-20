<script setup lang="ts">
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import { Icon } from "@iconify/vue";

definePageMeta({
  layout: "media",
});

const post = ref<Post>();
const current_media_index = ref(0);
const router = useRouter();
const route = useRoute();
const postStore = usePostsStore();
const long_post_media = computed(() => {
  if (!post.value?.longPost?.content) return [];
  return post.value?.longPost?.content.map((content) => content.media).flat();
});
const long_post_media_types = computed(() => {
  if (!post.value?.longPost?.content) return [];
  return post.value?.longPost?.content
    .map((content) => content.mediaTypes)
    .flat();
});

onBeforeMount(async () => {
  post.value = await postStore.findPostById(route.query.postId as string);
  current_media_index.value = Number(route.query.media);
});

watch(
  () => current_media_index.value,
  () => {
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        media: current_media_index.value,
      },
    });
  },
);

watch(
  () => route.query.media,
  () => {
    current_media_index.value = Number(route.query.media);
  },
);
</script>

<template>
  <div
    v-if="post"
    class="relative left-0 top-0 flex h-dvh w-full flex-col items-center justify-between pb-6"
  >
    <div class="text-sub flex w-full items-center justify-between py-4">
      <AppGoBack />
      <div class="cursor-pointer px-2">
        <Icon icon="ic:twotone-more-vert" class="text-2xl" />
      </div>
    </div>

    <PostsPostMultiMediaViewer
      v-if="post.type === 'LONG'"
      :id="post.id"
      :media="long_post_media as string[]"
      :media-types="long_post_media_types as string[]"
      :current="current_media_index"
    />
    <PostsPostMultiMediaViewer
      v-else
      :id="post.id"
      :media="post.media as string[]"
      :media-types="post.mediaTypes"
      :current="current_media_index"
    />

    <PostsSocialPostActions :post="post" class="w-full pl-4" />
  </div>
</template>
