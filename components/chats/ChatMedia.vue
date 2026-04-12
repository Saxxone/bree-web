<script lang="ts" setup>
import { useAuthStore } from "~/store/auth";
import type { MediaType } from "~/types/types";
import {
  pickVideoPlaybackSource,
  resolvePlaybackUrl,
} from "~/utils/playbackUrl";

interface Props {
  media: string;
  mediaPlayback?: string | null;
  mediaType: MediaType;
}

const props = defineProps<Props>();
const authStore = useAuthStore();
const { access_token } = storeToRefs(authStore);

const playbackSrc = computed(() => {
  const raw = pickVideoPlaybackSource(props.mediaPlayback, props.media);
  return resolvePlaybackUrl(raw, access_token.value);
});

const imageSrc = computed(() =>
  resolvePlaybackUrl(props.media, access_token.value),
);
</script>

<template>
  <div
    :class="{ 'max-h-40 w-full overflow-hidden': props.mediaType !== 'audio' }"
  >
    <AppImageRender v-if="props.mediaType === 'image'" :img="imageSrc" />
    <AppVideoRender
      v-if="props.mediaType === 'video'"
      :autoplay="true"
      :video="playbackSrc"
      :controls="true"
    />
    <AppAudioRender
      v-if="props.mediaType === 'audio'"
      :autoplay="true"
      :audio="playbackSrc"
      :controls="true"
    />
  </div>
</template>
