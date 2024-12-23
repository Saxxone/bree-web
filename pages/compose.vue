<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { usePostsStore } from "~/store/posts";
import type { LongPostBlock, Post, PostType } from "~/types/post";
import { useGlobalStore } from "~/store/global";
import app_routes from "~/utils/routes";

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
const router = useRouter();

const files = ref<File[]>([]);

const default_post: Partial<Post> = {
  text: "",
  media: [],
};
const route = useRoute();
const is_fetching = ref(false);
const is_comment = computed(() => route.query.id && route.query.comment);
const parent_post = ref<Post>();
const new_post = ref<Partial<Post>>({ ...default_post });

function processPost(): Partial<Post> | undefined {
  if (!new_post.value) {
    return;
  } else if (
    new_post.value.text?.trim() === "" &&
    !new_post.value?.media?.length
  ) {
    addSnack({
      type: "info",
      message: t("posts.post_must_have_media_or_text"),
      timeout: 1000,
    });
    throw new Error(t("posts.post_must_have_media_or_text"));
  }

  if (is_comment.value) new_post.value.parentId = route.query.id as string;

  return new_post.value;
}

function processLongPost(): Partial<Post> | undefined {
  if (!long_post_content.value.length) return;

  const contents: LongPostBlock[] = long_post_content.value.map((content) => {
    if (content.text?.trim() === "" || !content.media) {
      addSnack({
        type: "info",
        message: t("posts.all_posts_must_have_media_or_text"),
        timeout: 1000,
      });
    }

    return {
      text: content.text,
      media: content.media,
    } as LongPostBlock;
  });
  if (
    contents.some(
      (content) =>
        content === undefined ||
        content.text?.trim() === "" ||
        !content.media?.length,
    )
  )
    return;
  if (!contents.length) return;

  return {
    ...new_post.value,
    type: "LONG",
    longPost: {
      content: contents,
    },
  };
}

async function attemptCreatePost(type: "draft" | "publish" = "publish") {
  is_fetching.value = true;
  const p = post_type.value === "LONG" ? processLongPost() : processPost();
  if (!p) return;

  if (p) {
    try {
      await createPost(p, type);
      is_fetching.value = false;
      if (is_comment.value) {
        goToPost(parent_post.value?.id as string, {
          replace: true,
        });
      } else await router.replace(app_routes.home);
    } catch (e) {
      console.log(e);
    } finally {
      is_fetching.value = false;
    }
  }
}

onBeforeMount(async () => {
  page_title.value = is_comment.value
    ? t("posts.reply")
    : t("posts.create_post");
  if (route.query.id)
    parent_post.value = await findPostById(route.query.id as string);
});

const a = {
  fieldname: "bree.png",
  originalname: "bree.png",
  encoding: "7bit",
  mimetype: "image/png",
  destination: "/Users/saxxone/Documents/Projects/media",
  filename: "bree-b2787fb10b9e63a5f7f46f25b6feb10858.png",
  path: "/Users/saxxone/Documents/Projects/media/bree-b2787fb10b9e63a5f7f46f25b6feb10858.png",
  size: 34035,
};

const b = {
  assetId: null,
  base64: null,
  type: "image",
  fileName: "1000269513.png",
  duration: null,
  exif: null,
  height: 1516,
  uri: "file:///data/user/0/com.anonymous.breeapp/cache/ImagePicker/96f9396c-fa9e-4f3e-a066-9c823ff9fe2e.png",
  fileSize: 1275589,
  rotation: null,
  mimeType: "image/png",
  width: 970,
};
</script>

<template>
  <div class="lg:pt-14">
    <div v-if="is_comment && parent_post?.id">
      <PostsSocialPost
        :actions="!is_comment"
        :post="parent_post as Post"
        :is-fetching="is_fetching"
      />
      <Icon icon="ic:twotone-more-vert" class="text-2xl text-sub my-4" />
    </div>

    <PostsSelectPostType
      v-if="!is_comment"
      :type="post_type"
      @type="(type) => (post_type = type)"
    />

    <PostsShortPostBuilder
      v-model="new_post.text"
      :is_comment="is_comment"
      @file="new_post.media = $event"
      v-if="post_type === 'SHORT'"
    />

    <PostsLongPostBuilder
      v-else-if="post_type === 'LONG' && !is_comment"
      v-model:data="long_post_content"
    />

    <div class="mt-4 flex space-x-4 justify-end">
      <button
        :disabled="api_loading"
        type="button"
        class="btn-primary-outline btn-md text-white !px-8 rounded-lg"
        @click="attemptCreatePost('draft')"
        v-if="!is_comment"
      >
        {{ t("posts.draft") }}
      </button>
      <button
        :disabled="api_loading"
        type="button"
        class="btn-primary btn-md text-white !px-8 rounded-lg"
        @click="attemptCreatePost('publish')"
      >
        {{ is_comment ? t("posts.reply") : t("posts.publish") }}
      </button>
    </div>
  </div>
</template>
