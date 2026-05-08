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
const ff = useFeatureFlags();

const all_post_types = [
  {
    type: "SHORT" as PostType,
    label: t("posts.create_short_post"),
    flag: "posting.createShortPost",
  },
  {
    type: "LONG" as PostType,
    label: t("posts.create_long_post"),
    flag: "posting.createLongPost",
  },
];

const post_types = computed(() =>
  all_post_types.filter((pt) => ff.enabled(pt.flag)),
);
</script>

<template>
  <div
    v-if="post_types.length > 0"
    class="bg-base-white mb-4 grid items-center justify-items-stretch gap-3 rounded-lg border-gray-600 p-1"
    :class="post_types.length === 1 ? 'grid-cols-1' : 'grid-cols-2'"
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
