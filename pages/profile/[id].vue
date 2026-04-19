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
const is_fetching_user = ref(true);
const posts = ref<Post[]>([]);
const is_fetching_posts = ref(false);
const fetch_in_flight = ref(false);
const feed_exhausted = ref(false);
const take = ref(10);

async function fetchUserPosts() {
  if (fetch_in_flight.value || feed_exhausted.value) return;
  try {
    fetch_in_flight.value = true;
    is_fetching_posts.value = true;

    const response = await getUserPosts(
      route.params.id as string,
      {
        cursor: posts.value[posts.value.length - 1]?.id,
        take: take.value,
        skip: posts.value.length,
      },
      posts.value,
    );

    if (response.length <= posts.value.length) {
      feed_exhausted.value = true;
    }
    posts.value = response;
  } finally {
    is_fetching_posts.value = false;
    fetch_in_flight.value = false;
  }
}

async function fetchUserProfile() {
  try {
    is_fetching_user.value = true;
    user.value = await getUserProfile(route.params.id as string);
  } catch {
    user.value = null;
  } finally {
    is_fetching_user.value = false;
  }
}

function resetFeedState() {
  posts.value = [];
  feed_exhausted.value = false;
  fetch_in_flight.value = false;
  is_fetching_posts.value = false;
}

async function loadProfile() {
  resetFeedState();
  await fetchUserProfile();
  if (user.value) {
    await fetchUserPosts();
  }
}

onBeforeMount(() => {
  page_title.value = t("profile.page_title");
  void loadProfile();
});

watch(
  () => route.params.id,
  (id, prevId) => {
    if (!id || id === prevId) return;
    void loadProfile();
  },
);
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
          :feed-trailer-autoplay="true"
        />

        <AppEmptyData
          v-if="!is_fetching_posts && posts.length < 1"
          :message="t('profile.no_results')"
        />

        <AppInfiniteScroll
          v-else
          :loading="is_fetching_posts || feed_exhausted"
          @intersected="fetchUserPosts"
        />
      </div>
    </div>

    <AppEmptyData
      v-else-if="!is_fetching_user"
      :message="t('profile.no_results')"
    />
  </div>
</template>
