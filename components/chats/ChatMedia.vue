<script lang="ts" setup>
import type { MediaType } from "~/types/post";

interface Props {
  media: string;
  mediaType: MediaType;
}

const props = defineProps<Props>();
</script>

<template>
  <div :class="{ 'h-40 w-full overflow-hidden': props.mediaType !== 'audio' }">
    <AppImageRender v-if="props.mediaType === 'image'" :img="media" />
    <AppVideoRender v-if="props.mediaType === 'video'" :autoplay="true" :video="media" :controls="true" />
    <AppAudioRender v-if="props.mediaType === 'audio'" :autoplay="true" :audio="media" :controls="true" />
  </div>
</template>
