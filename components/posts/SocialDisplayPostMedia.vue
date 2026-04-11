<script setup lang="ts">
import { useAuthStore } from "~/store/auth";
import type { PostMediaMetadata } from "~/types/post";
import type { MediaType } from "~/types/types";
import app_routes from "~/utils/routes";
import { resolvePlaybackUrl } from "~/utils/playbackUrl";
import { resolveMediaTypes } from "~/utils/postMedia";
import { usePostMediaGridClasses } from "~/composables/usePostMediaGridClasses";

interface Props {
  media: string[];
  mediaPlayback?: string[];
  mediaMetadata?: PostMediaMetadata[];
  mediaTypes?: MediaType[];
  postId: string;
}

const props = defineProps<Props>();
const router = useRouter();
const authStore = useAuthStore();
const { access_token } = storeToRefs(authStore);

function videoPlaybackSrc(index: number): string {
  const raw = props.mediaPlayback?.[index] ?? (props.media[index] as string);
  return resolvePlaybackUrl(raw, access_token.value, {
    requiresAuth: props.mediaMetadata?.[index]?.requiresAuth,
    fileId: props.mediaMetadata?.[index]?.fileId,
  });
}

function imageMediaSrc(index: number): string {
  return resolvePlaybackUrl(props.media[index] as string, access_token.value, {
    requiresAuth: props.mediaMetadata?.[index]?.requiresAuth,
    fileId: props.mediaMetadata?.[index]?.fileId,
  });
}

const dynamicGridClasses = usePostMediaGridClasses(() => props.media.length);

const resolvedMediaTypes = computed(() =>
  resolveMediaTypes(props.media, props.mediaTypes, props.mediaMetadata),
);

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
      class="h-64 overflow-hidden rounded-lg lg:h-96"
      :class="dynamicGridClasses"
    >
      <div
        v-for="(url, index) in props.media"
        :key="url as string"
        class="h-full cursor-pointer overflow-hidden"
        :class="{
          'row-span-2': index === 0 && props.media.length === 3,
          'row-span-1': index >= 1 && index <= 2 && props.media.length === 3,
        }"
        @click.prevent.stop="selectMedia(index)"
      >
        <AppImageRender
          v-if="resolvedMediaTypes[index] === 'image'"
          :img="imageMediaSrc(index)"
        />
        <AppVideoRender
          v-if="resolvedMediaTypes[index] === 'video'"
          :video="videoPlaybackSrc(index)"
          :controls="false"
          :autoplay="true"
        />
      </div>
    </div>
  </div>
</template>
