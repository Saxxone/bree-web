<script setup lang="ts">
import { Icon } from "@iconify/vue";

interface Props {
  fileList: File[];
  removable: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<(e: "deleted", value: File[]) => void>();
const scroller = ref<HTMLElement | null>(null);
const files = ref<File[]>([]);
const timeout = ref<NodeJS.Timeout>();

function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

function removeFile(index: number) {
  const file = files.value.splice(index, 1);
  const removed_files = files.value.filter((f) => f.name !== file[0].name);
  emit("deleted", removed_files);
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
    class="relative flex snap-x items-center space-x-4 overflow-x-auto transition-all duration-300 ease-in-out"
    :class="fileList.length > 1 ? 'pb-3 pr-4' : ''"
  >
    <div
      v-for="(file, index) in fileList"
      :key="file.name"
      class="shrink-0 snap-start"
      :class="fileList.length > 1 ? 'relative h-56 w-48' : 'h-56 w-full'"
    >
      <div
        v-if="props.removable"
        class="absolute right-2 top-2 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-gray-800 text-gray-300"
        @click="removeFile(index)"
      >
        <Icon class="text-xl" icon="line-md:close-small" />
      </div>

      <NuxtImg
        v-if="file.type.includes('image')"
        :src="createObjectURL(file)"
        class="h-full w-full rounded-lg object-cover"
        :alt="file.name"
      />

      <video
        v-if="file.type.includes('video')"
        :src="createObjectURL(file)"
        class="h-full w-full rounded-lg object-cover"
        :autoplay="$props.fileList.length === 1"
        :alt="file.name"
      />
    </div>
  </div>
</template>
