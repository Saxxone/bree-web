<script setup lang="ts">
import { usePostsStore } from "~/store/posts";
import type { MediaType, Post } from "~/types/post";

interface Props {
  post: Post;
}

const props = defineProps<Props>();
const router = useRouter();
const route = useRoute();
const current_post = ref<Post>();
const postStore = usePostsStore();
const main_view_status = ref(false);
const main_view_index = ref(0);
const main_view_url = ref("");

const dynamicClass = computed(() => {
  switch (props.post.media?.length) {
    case 1:
      return "grid grid-cols-1";
    case 2:
      return "grid grid-cols-2 gap-1";
    case 3:
      return "grid grid-cols-2 gap-1 gap-y-2";
    default:
      return "grid grid-cols-2 gap-1 gap-y-2 grid-rows-2";
  }
});

async function selectMedia(index: number) {
  main_view_status.value = true;
  main_view_index.value = index;
  main_view_url.value = props.post.media?.[index] as string;
  await router.push({
    path: route.path,
    query: { media: index, post: props.post.id },
  });
}

async function closeMedia() {
  main_view_status.value = false;
  await router.go(-1);
  main_view_index.value = 0;
  main_view_url.value = "";
}

watch(
  () => route.query,
  (q) => {
    current_post.value = props.post;

    if (!current_post.value.id) postStore.findPostById(q.post as string);

    if (q.media) {
      console.log(q.media);
      selectMedia(parseInt(q.media as string));
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
</script>

<template>
  <div>
    <AppSpacerY size="xxs" />
    <div class="rounded-lg h-64 overflow-hidden" :class="dynamicClass" v-if="!main_view_status">
      <div
        @click.prevent.stop="selectMedia(index)"
        v-for="(url, index) in props.post.media"
        :key="url as string"
        class=""
        :class="{
          'h-64': index <= 2,
          'col-span-1 row-span-1': index >= 3,
        }">
        <PostsSocialPostImage
          v-if="props.post.mediaTypes?.[index] === 'image'"
          :class="{
            'mt-1': index >= 3,
          }"
          :img="url as string" />
        <PostsSocialPostVideo v-if="props.post.mediaTypes?.[index] === 'video'" :video="url as string" />
      </div>
    </div>

    <div v-if="main_view_status" class="fixed bg-gray-900 pb-6 flex flex-col items-center justify-between top-0 left-0 w-full h-screen z-100">
      <div class="flex w-full justify-between py-4 items-center text-white">
        <div @click="closeMedia" class="px-2 cursor-pointer">
          <span class="material-symbols-rounded"> arrow_back </span>
        </div>
        <div class="px-2 cursor-pointer">
          <span class="material-symbols-rounded"> more_vert </span>
        </div>
      </div>
      <div>
        <PostsSocialPostImage v-if="props.post.mediaTypes?.[main_view_index] === 'image'" :img="main_view_url" />
        <PostsSocialPostVideo v-if="props.post.mediaTypes?.[main_view_index] === 'video'" :video="main_view_url" />
      </div>

      <PostsSocialPostActions :post="props.post" class="pl-4 w-full" />
    </div>
  </div>
</template>
