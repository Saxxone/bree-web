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
  async (files) => {
    if (!files.length) {
      emit("file", files);
      return;
    }

    const file = await useUploadMedia(files);
    emit("file", file);
  },
  { debounce: 1000, deep: true },
);
</script>

<template>
  <div>
    <PostsFilePreview
      :file-list="files"
      @deleted="removeFile"
      :removable="true"
      class="mb-4 mt-3"
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
