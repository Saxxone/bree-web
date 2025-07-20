<script setup lang="ts">
import type { PostType } from "~/types/post";

interface Props {
  type: PostType;
}

const props = withDefaults(defineProps<Props>(), {
  type: "SHORT",
});

defineEmits(["type"]);

const { t } = useI18n();
const post_types = ref<{ type: PostType; label: string }[]>([
  { type: "SHORT", label: t("posts.create_short_post") },
  { type: "LONG", label: t("posts.create_long_post") },
]);
</script>

<template>
  <div
    class="bg-base-white mb-4 grid grid-cols-2 items-center justify-items-stretch gap-3 rounded-lg border-gray-600 p-1"
  >
    <button
      v-for="post_type in post_types"
      :key="post_type.type + '-post-style'"
      :class="props.type === post_type.type ? 'bg-base-light' : 'bg-base-white'"
      class="px-4 py-2 text-sm"
      @click="$emit('type', post_type.type)"
    >
      {{ post_type.label }}
    </button>
  </div>
</template>
