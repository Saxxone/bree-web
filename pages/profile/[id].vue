<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";
import { useAuthStore } from "~/store/auth";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const globalStore = useGlobalStore();
const { page_title, api_loading } = storeToRefs(globalStore);
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const postsStore = usePostsStore();
const { getUserPosts } = postsStore;
const route = useRoute();
const posts = ref<Post[]>([]);
const scroll_element = ref<HTMLElement | null>(null);
const take = ref(35);
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);

const { reset } = useInfiniteScroll(
  scroll_element,
  async () => {
    // current_page.value++;
    // await useDynamicScroll(scroll_element.value as HTMLElement, getUserPosts);
  },
  { distance: 10000000 }
);

async function fetchUserPosts() {
  posts.value = await getUserPosts(route.params.id as string, {
    cursor: posts.value[0]?.id,
    take: take.value,
    skip: skip.value,
  });
}

onBeforeMount(() => {
  page_title.value = t("posts.page_title");
  fetchUserPosts();
});
</script>

<template>
  <div>
    <ProfileTop :user="user" />

    <div class="pt-6">
      <div ref="scroll_element">
        <PostsSocialPost v-for="post in posts" :key="post.id" :post="post" />
      </div>
    </div>
  </div>
</template>
