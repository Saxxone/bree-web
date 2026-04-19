<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave } from "vue-router";
import { resolvePendingPostMedia } from "~/composables/resolvePendingPostMedia";
import { useGlobalStore } from "~/store/global";
import { usePostsStore } from "~/store/posts";
import type { LongPostBlock, Post } from "~/types/post";

definePageMeta({
  layout: "base",
});

const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";

const { t } = useI18n();
const postsStore = usePostsStore();
const { createPost } = postsStore;
const globalStore = useGlobalStore();
const { addSnack } = globalStore;

const long_post_content = ref<LongPostBlock[]>([]);
const { page_title, api_loading } = storeToRefs(globalStore);

const default_post: Partial<Post> = {
  text: "",
  media: [],
};
const new_post = ref<Partial<Post>>({ ...default_post });
const is_submitting = ref(false);
const upload_modal_open = ref(false);
const upload_progress = ref(0);

function processLongPost(): Partial<Post> | undefined {
  if (!long_post_content.value.length) return;

  const contents: LongPostBlock[] = long_post_content.value.map(
    (content) =>
      ({
        text: content.text ?? "",
        media: content.media ?? [],
      }) as LongPostBlock,
  );

  const hasInvalidSlide = contents.some((content) => {
    const textEmpty = (content.text?.trim() ?? "") === "";
    const noMedia = !content.media?.length;
    return textEmpty && noMedia;
  });

  if (hasInvalidSlide) {
    addSnack({
      type: "info",
      message: t("posts.all_posts_must_have_media_or_text"),
      timeout: 1000,
    });
    return;
  }

  return {
    ...new_post.value,
    type: "LONG",
    longPost: {
      content: contents,
    },
  };
}

async function attemptCreatePost(type: "draft" | "publish" = "publish") {
  const p = processLongPost();
  if (!p) return;

  is_submitting.value = true;
  upload_modal_open.value = true;
  upload_progress.value = 0;
  try {
    const resolved = await resolvePendingPostMedia(p, (pct) => {
      upload_progress.value = pct;
    });
    const created = await createPost(resolved, type);
    goToPost(created.id, { replace: true });
  } catch (e) {
    console.log(e);
  } finally {
    is_submitting.value = false;
    upload_modal_open.value = false;
  }
}

onBeforeRouteLeave(() => {
  if (is_submitting.value) return false;
});

onBeforeMount(() => {
  page_title.value = t("posts.upload_video");
});
</script>

<template>
  <div class="lg:pt-14">
    <PostsMediaUploadProgressModal
      v-model:open="upload_modal_open"
      v-model:progress="upload_progress"
    />

    <PostsLongPostBuilder
      v-model:data="long_post_content"
      single-page
      :media-accept="VIDEO_ACCEPT"
      :add-media-label="t('posts.add_video')"
    />

    <div class="mt-4 flex justify-end space-x-4">
      <button
        :disabled="api_loading || is_submitting"
        type="button"
        class="btn-primary-outline btn-md rounded-lg !px-8 text-white"
        @click="attemptCreatePost('draft')"
      >
        {{ t("posts.draft") }}
      </button>
      <button
        :disabled="api_loading || is_submitting"
        type="button"
        class="btn-primary btn-md rounded-lg !px-8 text-white"
        @click="attemptCreatePost('publish')"
      >
        {{ t("posts.publish") }}
      </button>
    </div>
  </div>
</template>
