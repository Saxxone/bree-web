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

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    console.log(item);
    if (item?.kind === "file" && item?.type.startsWith("image/")) {
      const file: File | null = item?.getAsFile();
      if (file) {
        console.log(file);
        // Handle single and multiple file uploads
        if (props.maxFiles > 1 || !fileList.value.length) {
          fileList.value.push(file);
          media.value = fileList.value;
          emit("update", fileList.value);
        } else {
          fileList.value = [file];
          media.value = fileList.value;
          emit("update", fileList.value);
        }
      }
    }
  }
}

onBeforeMount(() => {
  //TODO ADD media from clipboard
  document.addEventListener("paste", handlePaste);
});

onBeforeUnmount(() => {
  document.removeEventListener("paste", handlePaste);
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
