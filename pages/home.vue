<script lang="ts" setup>
import { usePostsStore } from "~/store/posts";
import { useInfiniteScroll } from "@vueuse/core";

definePageMeta({
  layout: "social",
});

const postsStore = usePostsStore();
const scroll_element = ref<HTMLElement | null>(null);
const is_loading = ref(false);
const take = ref(4);
const current_page = ref(1);
const skip = computed(() => take.value * current_page.value);

const { reset } = useInfiniteScroll(
  scroll_element,
  async () => {
    // await loadMore();
  },
  { distance: 10000000 }
);

async function loadMore() {
  current_page.value++;
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  is_loading.value = true;
  await getFeed();
  is_loading.value = false;
}

async function getFeed() {
  await postsStore.getFeed({ cursor: postsStore.feed[0]?.id, take: take.value, skip: skip.value });
}

onMounted(async () => {
  getFeed();
});
</script>

<template>
  <div>
    <div v-show="is_loading">Loading... please wait</div>
    <div ref="scroll_element">
      <PostsSocialPost v-for="post in postsStore.feed" :key="post.id" :post="post" />
    </div>
    <PostsStartPost />
  </div>
</template>
