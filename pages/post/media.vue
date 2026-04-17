<script setup lang="ts">
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import { Icon } from "@iconify/vue";
import { resolveMediaTypes } from "~/utils/postMedia";

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
  return post.value.longPost.content.flatMap((content) => {
    const m = content.media ?? [];
    return resolveMediaTypes(m, content.mediaTypes, content.mediaMetadata);
  });
});
const long_post_media_playback = computed((): (string | undefined)[] => {
  if (!post.value?.longPost?.content) return [];
  return post.value.longPost.content.flatMap((content) => {
    const m = content.media ?? [];
    const p = content.mediaPlayback;
    return m.map((_, i) => p?.[i]);
  });
});
const long_post_media_metadata = computed(() => {
  if (!post.value?.longPost?.content) return [];
  return post.value.longPost.content.flatMap((content) => {
    const m = content.media ?? [];
    const meta = content.mediaMetadata;
    return m.map((_, i) => meta?.[i]);
  });
});

async function loadPost() {
  const id = route.query.postId as string;
  if (!id) return;
  post.value = await postStore.findPostById(id, { network: true });
}

onBeforeMount(async () => {
  await loadPost();
  const m = Number(route.query.media);
  current_media_index.value = Number.isFinite(m) ? m : 0;
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
      :post-id="post.id"
      :priced-cost-minor="post.pricedCostMinor"
      :media="long_post_media as string[]"
      :media-playback="long_post_media_playback"
      :media-metadata="long_post_media_metadata"
      :media-types="long_post_media_types"
      :current="current_media_index"
      @unlocked="loadPost"
    />
    <PostsPostMultiMediaViewer
      v-else
      :post-id="post.id"
      :priced-cost-minor="post.pricedCostMinor"
      :media="post.media as string[]"
      :media-playback="post.mediaPlayback"
      :media-metadata="post.mediaMetadata"
      :media-types="post.mediaTypes"
      :current="current_media_index"
      @unlocked="loadPost"
    />

    <PostsSocialPostActions :post="post" class="w-full pl-4" />
  </div>
</template>
