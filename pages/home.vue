<script lang="ts" setup>
import { usePostsStore } from "~/store/posts";
import { useGlobalStore } from "~/store/global";

definePageMeta({
  layout: "social",
});

const { t } = useI18n();
const postsStore = usePostsStore();
const { getFeed } = postsStore;
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const is_fetching = ref(true);
const take = ref(35);
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);

async function fetchFeed() {
  is_fetching.value = true;
  await getFeed({
    cursor: postsStore.feed?.[0]?.id,
    take: take.value,
    skip: skip.value,
  });
  is_fetching.value = false;
}

onBeforeMount(async () => {
  page_title.value = t("home.page_title");
  fetchFeed();
});
</script>

<template>
  <div>
    <div ref="scroll_element">
      <PostsSocialPost
        v-for="post in postsStore.feed"
        :key="post.id"
        :post="post"
        :is-fetching="is_fetching"
      />
    </div>
    <AppSpacerY size="md" />
  </div>
</template>
