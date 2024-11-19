<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";
import { usePostsStore } from "~/store/posts";
import { useUsersStore } from "~/store/users";
import type { Post } from "~/types/post";
import type { User } from "~/types/user";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const globalStore = useGlobalStore();
const { page_title, api_loading } = storeToRefs(globalStore);

const postsStore = usePostsStore();
const { getUserPosts } = postsStore;
const userStore = useUsersStore();
const { getUserProfile } = userStore;
const route = useRoute();
const user = ref<User | null>(null);
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

async function fetchUserProfile() {
  user.value = await getUserProfile(route.params.id as string);
}

onBeforeMount(() => {
  page_title.value = t("profile.page_title");
  fetchUserProfile();
  fetchUserPosts();
});
</script>

<template>
  <div>
    <div v-if="user">
      <ProfileTop :user="user" />

      <div class="pt-6">
        <div ref="scroll_element">
          <PostsSocialPost v-for="post in posts" :key="post.id" :post="post" />
        </div>
      </div>
    </div>

    <AppEmptyData v-else :message="t('profile.no_result')" />
  </div>
</template>
