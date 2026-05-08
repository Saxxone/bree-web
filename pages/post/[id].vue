<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useRoute, useRouter } from "vue-router";
import { useGlobalStore } from "~/store/global";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import { useApiConnect } from "~/composables/useApiConnect";
import api_routes from "~/utils/api_routes";
import app_routes from "~/utils/routes";
import { FetchMethod } from "~/types/types";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const postsStore = usePostsStore();
const { findPostById, getComments } = postsStore;
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const route = useRoute();
const router = useRouter();
const post = ref<Post>();
const ff = useFeatureFlags();
const commentsEnabled = computed(() => ff.enabled("posting.comments"));
const watchTogetherEnabled = computed(() => ff.enabled("social.watchTogether"));
const watchTogetherHostApprovalEnabled = computed(() =>
  ff.enabled("social.watchTogetherHostApproval"),
);
const requireHostApproval = ref(false);

function postHasVideoMedia(p: Post | undefined): boolean {
  if (!p) return false;
  if (p.mediaTypes?.includes("video")) return true;
  if (p.type === "LONG" && p.longPost?.content?.length) {
    return p.longPost.content.some((b) =>
      (b.mediaTypes ?? []).includes("video"),
    );
  }
  return false;
}

const showWatchTogether = computed(
  () => watchTogetherEnabled.value && postHasVideoMedia(post.value),
);

async function startWatchTogether() {
  if (!post.value?.id) return;
  const body: { postId: string; requireHostApproval?: boolean } = {
    postId: post.value.id,
  };
  if (watchTogetherHostApprovalEnabled.value) {
    body.requireHostApproval = requireHostApproval.value;
  }
  const res = await useApiConnect<typeof body, { id: string }>(
    api_routes.watchTogether.create,
    FetchMethod.POST,
    body,
  );
  if ("message" in res) return;
  void router.push(app_routes.watchTogether.session(res.id));
}
const is_fetching = ref(false);
const is_fetching_parent = ref(false);
const is_fetching_comments = ref(false);
const parentPost = ref<Post>();
const comments = ref<Post[]>([]);
const take = ref(10);
const skip = ref(0);
const comments_exhausted = ref(false);
const comments_fetch_in_flight = ref(false);
let postLoadToken = 0;

function scrollToMainPost() {
  const element = document.getElementById("main_post");
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

async function getParentPost(loadToken: number) {
  if (!post.value?.parentId) return;
  try {
    is_fetching_parent.value = true;
    const p = await findPostById(post.value.parentId);
    if (loadToken !== postLoadToken) return;
    parentPost.value = p;
  } finally {
    is_fetching_parent.value = false;
  }
}

async function loadCommentsPage(reset: boolean, loadToken?: number) {
  if (!commentsEnabled.value) return;
  if (!post.value?.id || comments_fetch_in_flight.value) return;
  if (!reset && comments_exhausted.value) return;
  if (!reset && comments.value.length === 0) return;

  if (reset) {
    comments.value = [];
    skip.value = 0;
    comments_exhausted.value = false;
    if (!post.value.commentCount) {
      return;
    }
  }

  try {
    comments_fetch_in_flight.value = true;
    is_fetching_comments.value = true;
    const { merged, received } = await getComments(
      post.value.id,
      {
        cursor: comments.value[0]?.id,
        take: take.value,
        skip: skip.value,
      },
      comments.value,
    );
    if (loadToken != null && loadToken !== postLoadToken) return;
    comments.value = merged;
    if (received < take.value) {
      comments_exhausted.value = true;
    }
    if (received > 0) {
      skip.value += take.value;
    }
  } finally {
    is_fetching_comments.value = false;
    comments_fetch_in_flight.value = false;
  }
}

async function onCommentsIntersected() {
  if (!commentsEnabled.value) return;
  await loadCommentsPage(false, postLoadToken);
}

async function attemptFindPostById(id: string) {
  const token = ++postLoadToken;
  post.value = undefined;
  parentPost.value = undefined;
  comments.value = [];
  comments_exhausted.value = false;
  skip.value = 0;
  try {
    is_fetching.value = true;
    const loaded = await findPostById(id);
    if (token !== postLoadToken) return;
    post.value = loaded;
    if (!post.value) return;

    await nextTick();
    requestAnimationFrame(() => {
      if (token === postLoadToken) {
        scrollToMainPost();
      }
    });

    await Promise.all([
      post.value.parentId ? getParentPost(token) : Promise.resolve(),
      commentsEnabled.value ? loadCommentsPage(true, token) : Promise.resolve(),
    ]);
  } finally {
    if (token === postLoadToken) {
      is_fetching.value = false;
    }
  }
}

watch(
  () => route.params.id,
  (id) => {
    if (typeof id === "string" && id.length > 0) {
      void attemptFindPostById(id);
    }
  },
);

onBeforeMount(() => {
  page_title.value = t("posts.post");
  void attemptFindPostById(route.params.id as string);
});

const showCommentsBlock = computed(
  () =>
    commentsEnabled.value &&
    !!post.value?.id &&
    (post.value.commentCount > 0 || comments.value.length > 0),
);
</script>

<template>
  <div class="lg:pt-8">
    <div
      v-if="showWatchTogether && post?.id"
      class="mb-3 flex flex-col items-end gap-2 px-1"
    >
      <label
        v-if="watchTogetherHostApprovalEnabled"
        class="flex max-w-md cursor-pointer items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-200"
      >
        <input
          v-model="requireHostApproval"
          type="checkbox"
          class="border-gray-300 text-violet-600 focus:ring-violet/60 mt-0.5"
        />
        <span>
          <span class="font-medium">{{
            $t("watchTogether.requireHostApproval")
          }}</span>
          <span class="text-sub block text-xs">{{
            $t("watchTogether.requireHostApprovalHint")
          }}</span>
        </span>
      </label>
      <button
        type="button"
        class="focus-visible:ring-violet/60 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline focus-visible:ring-2 dark:bg-violet-500 dark:hover:bg-violet-600"
        @click="startWatchTogether"
      >
        <Icon icon="line-md:play" class="text-lg" aria-hidden="true" />
        {{ $t("watchTogether.start") }}
      </button>
    </div>

    <div v-if="parentPost" class="mb-1">
      <PostsSocialPost
        :key="post?.parentId as string"
        :post="parentPost"
        :is-fetching="is_fetching_parent"
        :paid-video-click-interstitial="parentPost.monetizationEnabled === true"
      />
      <Icon icon="ic:twotone-more-vert" class="text-sub my-4 text-2xl" />
    </div>

    <PostsSocialPost
      v-if="post?.id"
      id="main_post"
      :key="post.id"
      :post="post"
      :is-fetching="is_fetching"
      :paid-video-click-interstitial="post.monetizationEnabled === true"
      :record-video-watch="true"
    />

    <div v-if="showCommentsBlock" class="ml-3 mt-4">
      <PostsSocialPost
        v-for="comment in comments"
        :key="comment.id"
        :post="comment"
        :is-fetching="is_fetching_comments && comments.length < 1"
        :paid-video-click-interstitial="comment.monetizationEnabled === true"
      />
      <AppInfiniteScroll
        v-if="!comments_exhausted"
        :loading="is_fetching_comments"
        @intersected="onCommentsIntersected"
      />
    </div>
  </div>
</template>
