<script lang="ts" setup>
interface Props {
  text: string;
  truncate?: boolean;
  id: string;
}
const props = defineProps<Props>();

const route = useRoute();

const { t } = useI18n();
const is_visible = ref(false);
const show_more = computed(
  () => props.text.length > 140 && !props.truncate && !is_visible.value,
);

function handleShowMore() {
  if (route.name !== "post-id") {
    goToPost(props.id as string);
  } else is_visible.value = !is_visible.value;
}
</script>

<template>
  <div>
    <AppRichTextDisplay
      :text="props.text"
      class="text-sub select-text py-2"
      :class="{
        'h-32 overflow-hidden text-ellipsis md:h-28 lg:h-24 xl:h-20': show_more,
      }"
    />
    <div
      v-if="show_more"
      class="-mt-2 block py-3 text-sm text-purple-600"
      @click.prevent.stop="handleShowMore"
    >
      {{ t("posts.show_more") }}
    </div>
  </div>
</template>
