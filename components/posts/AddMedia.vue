<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useFileDialog } from "@vueuse/core";
import { useGlobalStore } from "~/store/global";

interface Props {
  maxFiles: number;
  multiple: boolean;
  icon: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [value: File[]];
}>();
const { t } = useI18n();
const globalStore = useGlobalStore();
const { addSnack } = globalStore;
const media = defineModel<File[] | string[] | undefined>("media");
const fileList = ref<File[]>([]);

const { open, onChange } = useFileDialog({
  accept: "image/jpeg, image/png, image/webp, video/mp4",
  directory: false,
  multiple: props.multiple,
});

function fileLimitExceeded() {
  addSnack({
    type: "info",
    message: t("posts.cannot_add_more_than_4"),
    timeout: 1000,
  });
}
function handleClick() {
  if (fileList.value.length && fileList.value.length >= 4) {
    fileLimitExceeded();
    return;
  }
  open();
}

onChange((files) => {
  if (!files) return;
  if (files.length > 4) fileLimitExceeded();

  if (props.maxFiles > 1) {
    if (fileList.value.length >= props.maxFiles) {
      fileLimitExceeded();
      return;
    }

    const numToAdd = fileList.value.length
      ? Math.max(0, props.maxFiles - fileList.value.length)
      : props.maxFiles;

    if (numToAdd === 0) return;

    Array.from(files)
      .slice(0, numToAdd)
      .forEach((file) => {
        fileList.value.push(file);
      });
    media.value = fileList.value;
    emit("update", fileList.value);
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
    if (item?.kind === "file" && item?.type.startsWith("image/")) {
      const file: File | null = item?.getAsFile();
      if (file) {
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
  document.addEventListener("paste", handlePaste);
});

onBeforeUnmount(() => {
  document.removeEventListener("paste", handlePaste);
});
</script>

<template>
  <div class="cursor-pointer" @click="handleClick">
    <Icon
      v-if="props.icon"
      icon="line-md:image-twotone"
      class="dark:text-gray-300 text-2xl mt-4"
    />
    <slot v-else />
  </div>
</template>
