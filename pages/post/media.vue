<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useApiConnect } from "~/composables/useApiConnect";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import { FetchMethod } from "~/types/types";
import api_routes from "~/utils/api_routes";
import { resolveMediaTypes } from "~/utils/postMedia";
import app_routes from "~/utils/routes";

definePageMeta({
  layout: "media",
});

const post = ref<Post>();
const current_media_index = ref(0);
const router = useRouter();
const route = useRoute();
const postStore = usePostsStore();
const ff = useFeatureFlags();
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
const long_post_media = computed(() => {
  if (!post.value?.longPost?.content) return [];
  return post.value?.longPost?.content.map((content) => content.media).flat();
});
const long_post_media_types = computed(() => {
  if (!post.value?.longPost?.content) return [];
  return post.value.longPost.content.flatMap((content) => {
    const m = content.media ?? [];
    return resolveMediaTypes(
      m as string[],
      content.mediaTypes,
      content.mediaMetadata,
    );
  });
});
const long_post_media_playback = computed((): (string | undefined)[] => {
  if (!post.value?.longPost?.content) return [];
  return post.value.longPost.content.flatMap((content) => {
    const m = content.media ?? [];
    const p = content.mediaPlayback;
    return m.map((_, i) => p?.[i]);
  });
});
const long_post_media_metadata = computed(() => {
  if (!post.value?.longPost?.content) return [];
  return post.value.longPost.content.flatMap((content) => {
    const m = content.media ?? [];
    const meta = content.mediaMetadata;
    return m.map((_, i) => meta?.[i]);
  });
});

async function loadPost() {
  const id = route.query.postId as string;
  if (!id) return;
  post.value = await postStore.findPostById(id, { network: true });
}

onBeforeMount(async () => {
  await loadPost();
  const m = Number(route.query.media);
  current_media_index.value = Number.isFinite(m) ? m : 0;
});

watch(
  () => current_media_index.value,
  () => {
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        media: current_media_index.value,
      },
    });
  },
);

watch(
  () => route.query.media,
  () => {
    current_media_index.value = Number(route.query.media);
  },
);
</script>

<template>
  <div
    v-if="post"
    class="relative left-0 top-0 flex h-dvh w-full flex-col items-center justify-between pb-6"
  >
    <div class="text-sub flex w-full items-center justify-between py-4">
      <AppGoBack />
      <div class="cursor-pointer px-2">
        <Icon icon="ic:twotone-more-vert" class="text-2xl" />
      </div>
    </div>

    <PostsPostMultiMediaViewer
      v-if="post.type === 'LONG'"
      :post-id="post.id"
      :priced-cost-minor="post.pricedCostMinor"
      :media="long_post_media as string[]"
      :media-playback="long_post_media_playback"
      :media-metadata="long_post_media_metadata"
      :media-types="long_post_media_types"
      :current="current_media_index"
      record-video-watch
      @unlocked="loadPost"
    />
    <PostsPostMultiMediaViewer
      v-else
      :post-id="post.id"
      :priced-cost-minor="post.pricedCostMinor"
      record-video-watch
      :media="post.media as string[]"
      :media-playback="post.mediaPlayback"
      :media-metadata="post.mediaMetadata"
      :media-types="post.mediaTypes"
      :current="current_media_index"
      @unlocked="loadPost"
    />

    <div
      v-if="showWatchTogether"
      class="flex w-full shrink-0 flex-col items-center gap-2 px-4 pb-2"
    >
      <label
        v-if="watchTogetherHostApprovalEnabled"
        class="flex w-full max-w-sm cursor-pointer items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
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
          <span class="block text-xs text-neutral-500 dark:text-neutral-400">{{
            $t("watchTogether.requireHostApprovalHint")
          }}</span>
        </span>
      </label>
      <button
        type="button"
        class="focus-visible:ring-violet/60 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline focus-visible:ring-2 dark:bg-violet-500 dark:hover:bg-violet-600 sm:w-auto"
        @click="startWatchTogether"
      >
        <Icon icon="line-md:play" class="text-lg" aria-hidden="true" />
        {{ $t("watchTogether.start") }}
      </button>
    </div>

    <PostsSocialPostActions :post="post" class="w-full pl-4" />
  </div>
</template>
