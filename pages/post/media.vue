<script setup lang="ts">
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";

definePageMeta({
  layout: "media",
});

const post = ref<Post>();
const current_media_index = ref(0);
const router = useRouter();
const route = useRoute();
const postStore = usePostsStore();

function goBack() {
  router.go(-1);
}

function goLeft() {
  current_media_index.value--;
}

function goRight() {
  current_media_index.value++;
}

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
  }
);

watch(
  () => route.query.media,
  () => {
    current_media_index.value = Number(route.query.media);
  }
);
</script>

<template>
  <div class="relative pb-6 flex flex-col items-center justify-between top-0 left-0 w-full h-screen" v-if="post">
    <div class="flex w-full justify-between py-4 items-center text-sub">
      <div @click="goBack" class="px-2 cursor-pointer">
        <span class="material-symbols-rounded text-2xl"> arrow_back </span>
      </div>
      <div class="px-2 cursor-pointer">
        <span class="material-symbols-rounded text-2xl"> more_vert </span>
      </div>
    </div>
    <div class="h-2/3 overflow-hidden flex items-center justify-center w-full">
      <div
        v-for="(file, index) in post.media"
        :key="file as string"
        class="w-full"
        :class="{
          hidden: index !== current_media_index,
        }">
        <div v-if="index === current_media_index">
          <div @click.prevent.stop="goLeft" class="arrow_button left-0" v-if="current_media_index > 0">
            <span class="material-symbols-rounded"> arrow_back </span>
          </div>

          <AppImageRender v-if="post.mediaTypes[current_media_index] === 'image'" :img="post.media[current_media_index] as string" />

          <AppVideoRender :controls="true" :autoplay="true" v-if="post.mediaTypes[current_media_index] === 'video'" :video="post.media[current_media_index] as string" />

          <div @click.prevent.stop="goRight" class="arrow_button right-0" v-if="current_media_index < post.media.length - 1">
            <span class="material-symbols-rounded"> arrow_forward </span>
          </div>
        </div>
      </div>
    </div>

    <PostsSocialPostActions :post="post" class="pl-4 w-full" />
  </div>
</template>

<style scoped lang="postcss">
.arrow_button {
  @apply cursor-pointer text-white h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center absolute top-1/2 mx-2 z-50;
}
</style>
