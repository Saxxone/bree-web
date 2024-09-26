<script lang="ts" setup>
import { HTMLInputType } from "~/types/types";
import { useI18n } from "vue-i18n";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import { useGlobalStore } from "~/store/global";
import app_routes from "~/utils/routes";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const postsStore = usePostsStore();
const globalStore = useGlobalStore();
const router = useRouter();

const files = ref<File[]>([]);
const is_uploading = ref(false);
const default_post: Partial<Post> = {
  text: "",
  media: [],
};
const route = useRoute();
const is_comment = computed(() => route.query.id && route.query.comment);
const post = ref<Partial<Post>>({ ...default_post });

function processPost(): Partial<Post> | undefined {
  if (!post.value) {
    return;
  } else if (post.value.text?.trim() === "" && !post.value?.media?.length) return;

  if (is_comment.value) post.value.parentId = route.query.id as string;

  return post.value;
}

async function uploadMedia(media: File[]): Promise<string[]> {
  is_uploading.value = true;
  const mediaUrls = await globalStore.uploadFiles(media);
  is_uploading.value = false;
  return mediaUrls;
}

async function createPost(type: "draft" | "publish" = "publish") {
  const p = processPost();
  if (p) {
    await postsStore.createPost(p, type);
    is_comment.value
      ? goToPost(post.value as Post, {
          replace: true,
        })
      : await router.replace(app_routes.home);
  }
}

async function findPostById(id: string) {
  post.value = (await postsStore.findPostById(id)) as Post;
}

onMounted(async () => {
  if (route.query.id) await findPostById(route.query.id as string);
  if (is_comment.value) post.value.text = "";
});

watchDebounced(
  () => files.value,
  async (files) => {
    if (!files.length) return;
    if (!post.value) return;

    post.value.media = await uploadMedia(files);
  },
  { debounce: 1000, deep: true }
);
</script>

<template>
  <div>
    <div class="flex items-center justify-between pb-2">
      <AppGoBack />
      <div class="font-medium text-gray-600 mr-4">
        {{ is_comment ? t("posts.reply") : t("posts.create_post") }}
      </div>
    </div>

    <div v-if="is_comment && post?.id">
      <PostsSocialPost :actions="!is_comment" :post="post as Post" />
      <span class="material-symbols-rounded filled text-gray-400"> more_vert </span>
    </div>

    <div class="mt-4">
      <FormsFormInput
        v-model="post.text"
        name="post"
        :input-type="HTMLInputType.Textarea"
        class="!p-0 !border-0"
        :rows="5"
        focus
        :placeholder="is_comment ? t('posts.comment_placeholder') : t('posts.placeholder')" />
    </div>

    <PostsAddMedia v-model:media="files" />

    <div class="mt-4 flex space-x-4 justify-end">
      <button :disabled="globalStore.api_loading || is_uploading" type="button" class="btn-primary-outline text-white !px-8 rounded-md" @click="createPost('draft')">
        {{ t("posts.draft") }}
      </button>
      <button :disabled="globalStore.api_loading || is_uploading" type="button" class="btn-primary text-white !px-8 rounded-md" @click="createPost('publish')">
        {{ is_comment ? t("posts.reply") : t("posts.publish") }}
      </button>
    </div>
  </div>
</template>
