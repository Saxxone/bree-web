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
const { page_title } = storeToRefs(globalStore);

const postsStore = usePostsStore();
const { getUserPosts } = postsStore;
const userStore = useUsersStore();
const { getUserProfile } = userStore;
const route = useRoute();
const user = ref<User | null>(null);
const posts = ref<Post[]>([]);
const is_fetching_posts = ref(true);
const take = ref(10);
const skip = ref(0);

async function fetchUserPosts() {
  try {
    if (skip.value > 0) if (skip.value > 0) skip.value += take.value;

    is_fetching_posts.value = true;
    posts.value = await getUserPosts(route.params.id as string, {
      cursor: posts.value[0]?.id,
      take: take.value,
      skip: skip.value,
    });
    is_fetching_posts.value = false;
  } catch {
    is_fetching_posts.value = false;
  }
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
      <ProfileTop :u="user" />

      <div class="pt-6">
        <PostsSocialPost
          v-for="post in posts"
          :key="post.id"
          :post="post"
          :is-fetching="is_fetching_posts && posts.length < 1"
        />
        <AppInfiniteScroll
          :loading="is_fetching_posts"
          @intersected="fetchUserPosts"
        />
      </div>
    </div>

    <AppEmptyData v-else :message="t('profile.no_results')" />
  </div>
</template>
