<script lang="ts" setup>
import { usePostsStore } from "~/store/posts";
import { useInfiniteScroll } from "@vueuse/core";

definePageMeta({
  layout: "social",
});

const postsStore = usePostsStore();
const scroll_element = ref<HTMLElement | null>(null);
const is_loading = ref(false);
const take = ref(35);
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);

const { reset } = useInfiniteScroll(
  scroll_element,
  async () => {
    // is_loading.value = true;
    // current_page.value++;
    // await useDynamicScroll(scroll_element.value as HTMLElement, getFeed);
    // is_loading.value = false;
  },
  { distance: 10000000 }
);

async function getFeed() {
  await postsStore.getFeed({ cursor: postsStore.feed[0]?.id, take: take.value, skip: skip.value });
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
  </div>
</template>
