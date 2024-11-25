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
    class="bg-base-white mb-4 p-1 border-gray-600 rounded-lg grid grid-cols-2 gap-3 justify-items-stretch items-center"
  >
    <button
      v-for="type in post_types"
      :key="type.type + '-post-style'"
      :class="props.type === type.type ? 'bg-base-light' : 'bg-base-white'"
      @click="$emit('type', type.type)"
      class="py-2 px-4 text-sm"
    >
      {{ type.label }}
    </button>
  </div>
</template>
