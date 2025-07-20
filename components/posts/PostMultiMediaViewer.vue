<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface Props {
  media: string[];
  mediaTypes: string[];
  current: number;
}

const props = defineProps<Props>();

const current_media_index = ref(0);
function goLeft() {
  current_media_index.value--;
}

function goRight() {
  current_media_index.value++;
}

watch(
  () => props.current,
  () => {
    current_media_index.value = props.current;
  },
);
</script>

<template>
  <div class="flex h-5/6 w-full items-center justify-center overflow-hidden">
    <TransitionGroup name="media" tag="div">
      <div
        v-for="(file, index) in media"
        :key="file + index + 'post_media_viewer'"
        class="relative flex h-full w-full items-center"
      >
        <div
          v-if="current_media_index > 0"
          class="arrow_button left-0"
          :class="[current_media_index === index ? '' : 'hide-item']"
          @click.prevent.stop="goLeft"
        >
          <Icon icon="line-md:arrow-left" class="text-md" />
        </div>

        <Transition>
          <div v-if="index === current_media_index" class="rounded-lg">
            <AppImageRender v-if="mediaTypes[index] === 'image'" :img="file" />

            <AppVideoRender
              v-if="mediaTypes[index] === 'video'"
              :controls="true"
              :autoplay="true"
              :video="file"
            />
          </div>
        </Transition>

        <div
          v-if="current_media_index < media.length - 1"
          class="arrow_button right-0"
          :class="[current_media_index === index ? '' : 'hide-item']"
          @click.prevent.stop="goRight"
        >
          <Icon icon="line-md:arrow-right" class="text-md" />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="postcss">
.arrow_button {
  @apply absolute top-1/2 z-50 mx-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-white;
}

.hide-item {
  transform: translateX(130px);
  position: absolute;
  top: 200px;
  @apply !hidden;
}

.media-enter-active,
.media-leave-active {
  transition: all 3s ease;
}
.media-enter-from,
.media-leave-to {
  opacity: 0;
  transform: translateX(130px);
}
</style>
