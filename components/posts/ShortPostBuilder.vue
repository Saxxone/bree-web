<script setup lang="ts">
import type { LocationQueryValue } from "vue-router";
import { HTMLInputType } from "~/types/types";

interface Props {
  is_comment?: LocationQueryValue | LocationQueryValue[];
}

const props = defineProps<Props>();

const { t } = useI18n();
const files = ref<File[]>([]);

const text = defineModel<string | null>();
</script>

<template>
  <div>
    <PostsFilePreview :file-list="files" :removable="true" class="mb-4 mt-3" />
    <AppRichTextEditor
      v-model="text"
      :placeholder="
        is_comment ? t('posts.comment_placeholder') : t('posts.placeholder')
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
