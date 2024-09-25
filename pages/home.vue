<script lang="ts" setup>
import { usePostsStore } from "~/store/posts";
import { useInfiniteScroll } from "@vueuse/core";

definePageMeta({
  layout: "social",
});

const postsStore = usePostsStore();
const scroll_element = ref<HTMLElement | null>(null);
const current_page = ref(1);

const { reset } = useInfiniteScroll(
  scroll_element,
  () => {
    // loadMore();
  },
  { distance: 10 }
);

function loadMore() {
  current_page.value++;
  getFeed();
}

async function getFeed() {
  await postsStore.getFeed(current_page.value);
}

onMounted(async () => {
  getFeed();
});
</script>

<template>
  <div>
    <div ref="scroll_element">
      <PostsSocialPost v-for="post in postsStore.feed" :key="post.id" :post="post" />
    </div>
    <PostsStartPost />
  </div>
</template>
