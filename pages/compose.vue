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
const parent_post = ref<Post>();
const new_post = ref<Partial<Post>>({ ...default_post });

function processPost(): Partial<Post> | undefined {
  if (!new_post.value) {
    return;
  } else if (new_post.value.text?.trim() === "" && !new_post.value?.media?.length) return;

  if (is_comment.value) new_post.value.parentId = route.query.id as string;

  return new_post.value;
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
      ? goToPost(parent_post.value as Post, {
          replace: true,
        })
      : await router.replace(app_routes.home);
  }
}

async function findPostById(id: string) {
  parent_post.value = (await postsStore.findPostById(id)) as Post;
}

onMounted(async () => {
  globalStore.page_name = is_comment ? t("posts.reply") : t("posts.create_post");
  if (route.query.id) await findPostById(route.query.id as string);
});

watchDebounced(
  () => files.value,
  async (files) => {
    if (!files.length) return;
    if (!new_post.value) return;

    new_post.value.media = await uploadMedia(files);
  },
  { debounce: 1000, deep: true }
);
</script>

<template>
  <div>
    <div v-if="is_comment && parent_post?.id">
      <PostsSocialPost :actions="!is_comment" :post="parent_post as Post" />
      <span class="material-symbols-rounded filled text-gray-400"> more_vert </span>
    </div>

    <div class="mt-4">
      <FormsFormInput
        v-model="new_post.text"
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
