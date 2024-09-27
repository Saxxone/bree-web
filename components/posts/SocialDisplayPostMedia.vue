<script setup lang="ts">
import { usePostsStore } from "~/store/posts";
import type { MediaType, Post } from "~/types/post";
import app_routes from "~/utils/routes";

interface Props {
  post: Post;
}

const props = defineProps<Props>();
const router = useRouter();
const route = useRoute();
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
    path: app_routes.post.view_media,
    query: { media: index, postId: props.post.id },
  });
}
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
  </div>
</template>
