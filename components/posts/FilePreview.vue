<script setup lang="ts">
interface Props {
  fileList: File[];
  removable: boolean;
}

const props = defineProps<Props>();

const files = ref<File[]>([]);
const media = ref<File[]>([]);

function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

function removeFile(index: number) {
  files.value = files.value.splice(index, 1);
}

watch(
  () => props.fileList,
  () => {
    files.value = props.fileList;
  },
);
</script>

<template>
  <div
    v-if="fileList"
    class="flex items-center overflow-x-auto snap-x space-x-4"
    :class="fileList.length > 1 ? 'space-x-4 pr-4 pb-3' : ''"
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
        <span class="material-symbols-rounded text-xl"> close </span>
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
