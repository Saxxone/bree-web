<script setup lang="ts">
import type { LocationQueryValue } from "vue-router";

interface Props {
  is_comment?: LocationQueryValue | LocationQueryValue[];
}

const { t } = useI18n();
const emit = defineEmits(["file"]);
const props = defineProps<Props>();

const files = ref<File[]>([]);

const text = defineModel<string | null>();

function removeFile(f: File[]) {
  files.value = f;
}

watchDebounced(
  () => files.value,
  async (f) => {
    if (!f.length) {
      emit("file", f);
      return;
    }
    try {
      const file = await useUploadMedia(f);
      emit("file", file);
    } catch {
      f.forEach((f) => {
        files.value = files.value.filter((file) => file.name !== f.name);
      });
    }
  },
  { debounce: 1000, deep: true },
);
</script>

<template>
  <div>
    <PostsFilePreview
      :file-list="files"
      :removable="true"
      class="mb-4 mt-3"
      @deleted="removeFile"
    />
    <AppRichTextEditor
      v-model="text"
      :placeholder="
        props.is_comment
          ? t('posts.comment_placeholder')
          : t('posts.placeholder')
      "
    />
    <div class="text-main text-right text-xs my-2">
      {{ text?.length }} / 300
    </div>
    <PostsAddMedia
      v-model:media="files"
      :max-files="4"
      :multiple="true"
      :icon="true"
    />
  </div>
</template>
