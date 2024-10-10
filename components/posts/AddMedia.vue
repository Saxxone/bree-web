<script setup lang="ts">
import { useFileDialog } from "@vueuse/core";

const media = defineModel<File[] | string[] | undefined>("media");
const fileList = ref<File[]>([]);
const { files, open, reset, onChange } = useFileDialog({
  accept: "image/*, video/*",
  directory: false,
});

const attachments = ref([
  {
    icon: "movie",
    key: "meia",
    command: open,
  },
]);

onChange((files) => {
  if (!files) return;

  Array.from(files).map((file) => {
    fileList.value.push(file);
  });
  media.value = fileList.value;
});

function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

function removeFile(index: number) {
  fileList.value.splice(index, 1);
  media.value = fileList.value;
}
</script>

<template>
  <div>
    <div v-if="fileList" class="overflow-x-scroll space-x-4">
      <div class="flex w-fit items-center space-x-4 pr-4 pb-3">
        <div
          v-for="(file, index) in fileList"
          :key="file.name"
          class="w-48 rounded-lg overflow-hidden relative h-56"
        >
          <div
            class="bg-gray-800 text-gray-300 flex items-center border border-gray-300 z-50 h-8 w-8 justify-center rounded-full absolute top-2 right-2"
            @click="removeFile(index)"
          >
            <span class="material-symbols-rounded text-xl"> close </span>
          </div>

          <NuxtImg
            v-if="file.type.includes('image')"
            :src="createObjectURL(file)"
            class="w-full h-full object-cover"
            :alt="file.name"
          />

          <video
            v-if="file.type.includes('video')"
            :src="createObjectURL(file)"
            class="w-full h-full object-cover"
            :alt="file.name"
          />
        </div>
      </div>
    </div>
    <div class="flex items-center pt-2 pb-2">
      <div
        v-for="(item, index) in attachments"
        :key="item.icon"
        class="cursor-pointer"
        @click="attachments[index].command()"
      >
        <span class="material-symbols-rounded text-2xl">{{ item.icon }}</span>
      </div>
    </div>
  </div>
</template>
