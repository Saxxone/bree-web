<script lang="ts" setup>
interface Props {
  text: string;
  truncate?: boolean;
}
const props = defineProps<Props>();

const { t } = useI18n();
const is_visible = ref(false);
const show_more = computed(
  () => props.text.length > 140 && !props.truncate && !is_visible.value,
);
</script>

<template>
  <div>
    <p
      class="text-sub py-2 outfit"
      :class="{
        'text-ellipsis overflow-hidden h-32 md:h-28 lg:h-24 xl:h-20': show_more,
      }"
    >
      {{ $props.text }}
    </p>
    <div
      v-if="show_more"
      @click.prevent.stop="is_visible = !is_visible"
      class="text-purple-600 py-2 -mt-2 block text-sm"
    >
      {{ t("posts.show_more") }}
    </div>
  </div>
</template>
