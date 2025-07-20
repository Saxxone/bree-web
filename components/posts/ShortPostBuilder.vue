<script setup lang="ts">
import type { LocationQueryValue } from "vue-router";

interface Props {
  isComment?: LocationQueryValue | LocationQueryValue[];
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
  async (new_files) => {
    if (!new_files.length) {
      emit("file", new_files);
      return;
    }
    try {
      const file = await useUploadMedia(new_files);
      emit("file", file);
    } catch {
      files.value = [];
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
        props.isComment
          ? t('posts.comment_placeholder')
          : t('posts.placeholder')
      "
    />
    <div class="text-main my-2 text-right text-xs">
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
