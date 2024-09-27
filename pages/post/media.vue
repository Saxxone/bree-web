<script setup lang="ts">
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";

const current_post = ref<Post>();
const current_media_index = ref(0);
const router = useRouter();
const route = useRoute();
const postStore = usePostsStore();

function closeMedia() {
  router.go(-1);
}

onMounted(async () => {
  current_post.value = await postStore.findPostById(route.query.postId as string);
});
</script>

<template>
  <div class="fixed bg-gray-900 pb-6 flex flex-col items-center justify-between top-0 left-0 w-full h-screen z-100" v-if="current_post">
    <div class="flex w-full justify-between py-4 items-center text-white">
      <div @click="closeMedia" class="px-2 cursor-pointer">
        <span class="material-symbols-rounded"> arrow_back </span>
      </div>
      <div class="px-2 cursor-pointer">
        <span class="material-symbols-rounded"> more_vert </span>
      </div>
    </div>
    <div>
      <PostsSocialPostImage v-if="current_post.mediaTypes[current_media_index] === 'image'" :img="current_post.media[current_media_index] as string" />
      <PostsSocialPostVideo v-if="current_post.mediaTypes[current_media_index] === 'video'" :video="current_post.media[current_media_index] as string" />
    </div>

    <PostsSocialPostActions :post="current_post" class="pl-4 w-full" />
  </div>
</template>
