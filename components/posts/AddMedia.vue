<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useFileDialog } from "@vueuse/core";

interface Props {
  maxFiles: number;
  multiple: boolean;
  icon: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [value: File[]];
}>();

const media = defineModel<File[] | string[] | undefined>("media");
const fileList = ref<File[]>([]);

const { open, onChange } = useFileDialog({
  accept: "image/jpeg, image/png, image/webp, video/mp4",
  directory: false,
  multiple: props.multiple,
});

onChange((files) => {
  if (!files) return;

  if (props.maxFiles > 1) {
    Array.from(files).map((file) => {
      fileList.value.push(file);
    });
    media.value = fileList.value;
  } else {
    fileList.value = [files[0]];
    media.value = fileList.value;
    emit("update", fileList.value);
  }
});
</script>

<template>
  <div class="cursor-pointer" @click="open()">
    <Icon
      icon="line-md:image-twotone"
      v-if="props.icon"
      class="dark:text-gray-300 text-2xl mt-4"
    />
    <slot v-else />
  </div>
</template>
