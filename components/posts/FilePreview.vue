<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface Props {
  fileList: File[];
  removable: boolean;
}

const props = defineProps<Props>();
const scroller = ref<HTMLElement | null>(null);
const files = ref<File[]>([]);
const timeout = ref<NodeJS.Timeout>();

function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

function removeFile(index: number) {
  files.value = files.value.splice(index, 1);
}

function goToPage(index: number) {
  if (!scroller.value || !(scroller.value instanceof HTMLElement)) return;

  const childWidth = scroller.value.offsetWidth || 0;
  const scrollLeft = index * childWidth;

  scroller.value.scrollTo({
    left: scrollLeft,
    behavior: "smooth",
  });
}

watch(
  () => props.fileList,
  () => {
    files.value = props.fileList;
    timeout.value = setTimeout(() => {
      goToPage(props.fileList.length - 1);
    }, 1000);
  },
  { immediate: true, deep: true },
);

onBeforeUnmount(() => {
  clearTimeout(timeout.value);
});
</script>

<template>
  <div
    v-if="fileList"
    ref="scroller"
    class="flex items-center relative overflow-x-auto snap-x space-x-4 transition-all duration-300 ease-in-out"
    :class="fileList.length > 1 ? 'pr-4 pb-3' : ''"
  >
    <div
      v-for="(file, index) in fileList"
      :key="file.name"
      class="snap-start shrink-0"
      :class="fileList.length > 1 ? 'w-48 relative h-56' : 'h-56 w-full'"
    >
      <div
        v-if="props.removable"
        class="bg-gray-800 text-gray-300 flex items-center border border-gray-300 z-50 h-8 w-8 justify-center rounded-full absolute top-2 right-2"
        @click="removeFile(index)"
      >
        <Icon class="text-xl" icon="line-md:close-small" />
      </div>

      <NuxtImg
        v-if="file.type.includes('image')"
        :src="createObjectURL(file)"
        class="w-full h-full object-cover rounded-lg"
        :alt="file.name"
      />

      <video
        v-if="file.type.includes('video')"
        :src="createObjectURL(file)"
        class="w-full h-full object-cover rounded-lg"
        :autoplay="$props.fileList.length === 1"
        :alt="file.name"
      />
    </div>
  </div>
</template>
