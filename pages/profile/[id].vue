<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";
import { useAuthStore } from "~/store/auth";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";

definePageMeta({
  layout: "base",
});

const globalStore = useGlobalStore();
const authStore = useAuthStore();
const postsStore = usePostsStore();
const route = useRoute();
const posts = ref<Post[]>([]);
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
    // await useDynamicScroll(scroll_element.value as HTMLElement, getUserPosts);
    // is_loading.value = false;
  },
  { distance: 10000000 }
);

async function getUserPosts() {
  posts.value = await postsStore.getUserPosts(route.params.id as string, { cursor: posts.value[0]?.id, take: take.value, skip: skip.value });
}

onMounted(async () => {
  getUserPosts();
});

onMounted(() => {
  globalStore.page_name = "";
});
</script>

<template>
  <div>
    <ProfileTop :user="authStore.user" />

    <div class="pt-6">
      <div ref="scroll_element">
        <PostsSocialPost v-for="post in posts" :key="post.id" :post="post" />
      </div>
    </div>
  </div>
</template>
