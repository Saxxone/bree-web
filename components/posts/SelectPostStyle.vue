<script setup lang="ts">
import type { PostStyle } from "~/types/post";

interface Props {
  style: PostStyle;
}

const props = withDefaults(defineProps<Props>(), {
  style: "short",
});

defineEmits(["style"]);

const { t } = useI18n();
const post_styles = ref<{ style: PostStyle; label: string }[]>([
  { style: "short", label: t("posts.create_short_post") },
  { style: "long", label: t("posts.create_long_post") },
]);
</script>

<template>
  <div
    class="bg-base-white mb-4 p-1 border-gray-600 rounded-lg grid grid-cols-2 gap-3 justify-items-stretch items-center"
  >
    <button
      v-for="style in post_styles"
      :key="style.style + '-post-style'"
      :class="props.style === style.style ? 'bg-base-light' : 'bg-base-white'"
      @click="$emit('style', style.style)"
      class="py-2 px-4 text-sm"
    >
      {{ style.label }}
    </button>
  </div>
</template>
