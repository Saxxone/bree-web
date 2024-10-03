<script setup lang="ts">
import type { Post } from "~/types/post";
import app_routes from "~/utils/routes";

interface Props {
  post: Post;
}

const props = defineProps<Props>();
const router = useRouter();

const dynamicGridClasses = computed(() => {
  switch (props.post.media.length) {
    case 1:
      return "grid grid-cols-1";
    case 2:
      return "grid grid-cols-2 gap-1";
    case 3:
      return "grid grid-cols-2 gap-1";
    default:
      return "grid grid-cols-2 gap-1 grid-rows-2";
  }
});

async function selectMedia(index: number) {
  await router.push({
    path: app_routes.post.view_media,
    query: { media: index, postId: props.post.id },
  });
}
</script>

<template>
  <div>
    <AppSpacerY size="xxs" />
    <div
      class="rounded-lg h-64 lg:h-96 overflow-hidden"
      :class="dynamicGridClasses"
    >
      <div
        @click.prevent.stop="selectMedia(index)"
        v-for="(url, index) in props.post.media"
        :key="url as string"
        class="overflow-hidden cursor-pointer h-full"
        :class="{
          'row-span-2': index === 0 && post.media.length === 3,
          'row-span-1': index >= 1 && index <= 2 && post.media.length === 3,
        }"
      >
        <PostsSocialPostImage
          v-if="props.post.mediaTypes?.[index] === 'image'"
          :img="url as string"
        />
        <PostsSocialPostVideo
          v-if="props.post.mediaTypes?.[index] === 'video'"
          :video="url as string"
        />
      </div>
    </div>
  </div>
</template>
