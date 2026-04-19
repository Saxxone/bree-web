<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave } from "vue-router";
import { resolvePendingPostMedia } from "~/composables/resolvePendingPostMedia";
import { useGlobalStore } from "~/store/global";
import { usePostsStore } from "~/store/posts";
import type { LongPostBlock, Post, PostType } from "~/types/post";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const postsStore = usePostsStore();
const { createPost, findPostById } = postsStore;
const globalStore = useGlobalStore();
const { addSnack } = globalStore;
const post_type = ref<PostType>("SHORT");

const long_post_content = ref<LongPostBlock[]>([]);
const { page_title, api_loading } = storeToRefs(globalStore);

const default_post: Partial<Post> = {
  text: "",
  media: [],
};
const route = useRoute();
const is_fetching = ref(false);
const is_comment = computed(() => route.query.id && route.query.comment);
const parent_post = ref<Post>();
const new_post = ref<Partial<Post>>({ ...default_post });
const upload_modal_open = ref(false);
const upload_progress = ref(0);

function processPost(): Partial<Post> | undefined {
  if (!new_post.value) {
    return;
  }
  const textEmpty = (new_post.value.text?.trim() ?? "") === "";
  const noMedia = !new_post.value?.media?.length;
  if (textEmpty && noMedia) {
    addSnack({
      type: "info",
      message: t("posts.post_must_have_media_or_text"),
      timeout: 1000,
    });
    return;
  }

  if (is_comment.value) new_post.value.parentId = route.query.id as string;

  return new_post.value;
}

function processLongPost(): Partial<Post> | undefined {
  if (!long_post_content.value.length) return;

  const contents: LongPostBlock[] = long_post_content.value.map(
    (content) =>
      ({
        text: content.text ?? "",
        media: content.media ?? [],
      }) as LongPostBlock,
  );

  // Match short posts: each slide needs text or media (not both).
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
  const p = post_type.value === "LONG" ? processLongPost() : processPost();
  if (!p) return;

  is_fetching.value = true;
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
    is_fetching.value = false;
    upload_modal_open.value = false;
  }
}

onBeforeRouteLeave(() => {
  if (is_fetching.value) return false;
});

onBeforeMount(async () => {
  page_title.value = is_comment.value
    ? t("posts.reply")
    : t("posts.create_post");
  if (route.query.id)
    parent_post.value = await findPostById(route.query.id as string);
});
</script>

<template>
  <div class="lg:pt-14">
    <div v-if="is_comment && parent_post?.id">
      <PostsSocialPost
        :actions="!is_comment"
        :post="parent_post as Post"
        :is-fetching="is_fetching"
        :paid-video-click-interstitial="false"
      />
      <Icon icon="ic:twotone-more-vert" class="text-sub my-4 text-2xl" />
    </div>

    <PostsSelectPostType
      v-if="!is_comment"
      :type="post_type"
      @type="(type) => (post_type = type)"
    />

    <PostsShortPostBuilder
      v-if="post_type === 'SHORT'"
      v-model="new_post.text"
      :is-comment="is_comment"
      @file="new_post.media = $event"
    />

    <PostsLongPostBuilder
      v-else-if="post_type === 'LONG' && !is_comment"
      v-model:data="long_post_content"
    />

    <div class="mt-4 flex justify-end space-x-4">
      <PostsMediaUploadProgressModal
        v-model:open="upload_modal_open"
        v-model:progress="upload_progress"
      />

      <button
        v-if="!is_comment"
        :disabled="api_loading || is_fetching"
        type="button"
        class="btn-primary-outline btn-md rounded-lg !px-8 text-white"
        @click="attemptCreatePost('draft')"
      >
        {{ t("posts.draft") }}
      </button>
      <button
        :disabled="api_loading || is_fetching"
        type="button"
        class="btn-primary btn-md rounded-lg !px-8 text-white"
        @click="attemptCreatePost('publish')"
      >
        {{ is_comment ? t("posts.reply") : t("posts.publish") }}
      </button>
    </div>
  </div>
</template>
