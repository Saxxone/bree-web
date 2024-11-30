<script lang="ts" setup>
interface Props {
  text: string;
  truncate?: boolean;
  id: string;
}
const props = defineProps<Props>();

const route = useRoute();
const router = useRouter();

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
    <p
      class="text-sub py-2 select-text"
      :class="{
        'text-ellipsis overflow-hidden h-32 md:h-28 lg:h-24 xl:h-20': show_more,
      }"
    >
      {{ $props.text }}
    </p>
    <div
      v-if="show_more"
      class="text-purple-600 py-3 -mt-2 block text-sm"
      @click.prevent.stop="handleShowMore"
    >
      {{ t("posts.show_more") }}
    </div>
  </div>
</template>
