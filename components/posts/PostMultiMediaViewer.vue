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
  <div class="h-5/6 overflow-hidden flex items-center justify-center w-full">
    <TransitionGroup name="media" tag="div">
      <div
        class="w-full h-full items-center flex relative"
        v-for="(file, index) in media"
        :key="file + index + 'post_media_viewer'"
      >
        <div
          v-if="current_media_index > 0"
          class="arrow_button left-0"
          @click.prevent.stop="goLeft"
          :class="[current_media_index === index ? '' : 'hide-item']"
        >
          <Icon icon="line-md:arrow-left" class="text-md" />
        </div>

        <Transition>
          <div
            v-if="index === current_media_index"
            class="bg-gray-600 py-4 rounded-lg"
          >
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
  @apply cursor-pointer text-white h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center absolute top-1/2 mx-2 z-50;
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
