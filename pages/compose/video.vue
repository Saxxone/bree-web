<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useGlobalStore } from "~/store/global";
import { usePostsStore } from "~/store/posts";
import type { LongPostBlock, Post } from "~/types/post";
import app_routes from "~/utils/routes";

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
const router = useRouter();

const default_post: Partial<Post> = {
  text: "",
  media: [],
};
const new_post = ref<Partial<Post>>({ ...default_post });

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
  try {
    const p = processLongPost();
    if (!p) return;

    await createPost(p, type);
    await router.replace(app_routes.home);
  } catch (e) {
    console.log(e);
  }
}

onBeforeMount(() => {
  page_title.value = t("posts.create_video_post");
});
</script>

<template>
  <div class="lg:pt-14">
    <PostsLongPostBuilder
      v-model:data="long_post_content"
      single-page
      :media-accept="VIDEO_ACCEPT"
      :add-media-label="t('posts.add_video')"
    />

    <div class="mt-4 flex justify-end space-x-4">
      <button
        :disabled="api_loading"
        type="button"
        class="btn-primary-outline btn-md rounded-lg !px-8 text-white"
        @click="attemptCreatePost('draft')"
      >
        {{ t("posts.draft") }}
      </button>
      <button
        :disabled="api_loading"
        type="button"
        class="btn-primary btn-md rounded-lg !px-8 text-white"
        @click="attemptCreatePost('publish')"
      >
        {{ t("posts.publish") }}
      </button>
    </div>
  </div>
</template>
