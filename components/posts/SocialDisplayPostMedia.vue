<script setup lang="ts">
import type { MediaType } from "~/types/types";
import app_routes from "~/utils/routes";

interface Props {
  media: string[];
  mediaTypes?: MediaType[];
  postId: string;
}

const props = defineProps<Props>();
const router = useRouter();

const dynamicGridClasses = computed(() => {
  switch (props.media.length) {
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
    query: { media: index, postId: props.postId },
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
        v-for="(url, index) in props.media"
        :key="url as string"
        class="overflow-hidden cursor-pointer h-full"
        :class="{
          'row-span-2': index === 0 && media.length === 3,
          'row-span-1': index >= 1 && index <= 2 && media.length === 3,
        }"
        @click.prevent.stop="selectMedia(index)"
      >
        <AppImageRender
          v-if="props.mediaTypes?.[index] === 'image'"
          :img="url as string"
        />
        <AppVideoRender
          v-if="props.mediaTypes?.[index] === 'video'"
          :video="url as string"
          :controls="false"
          :autoplay="true"
        />
      </div>
    </div>
  </div>
</template>
