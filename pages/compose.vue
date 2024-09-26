<script lang="ts" setup>
import { HTMLInputType } from "~/types/types";
import { useI18n } from "vue-i18n";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import { useGlobalStore } from "~/store/global";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const postsStore = usePostsStore();
const globalStore = useGlobalStore();
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
  
  if (post.value?.media) uploadMedia(post.value.media as File[]);

  return post.value;
}

async function uploadMedia(media: File[]) {
  if (!media.length) return;
  if (!post.value) return;

  const mediaUrls = await globalStore.uploadFiles(media);
  post.value.media = mediaUrls;
}

async function createPost(type: "draft" | "publish" = "publish") {
  const p = processPost();

  // if (p) {
  //   await postsStore.createPost(p, type);
  //   is_comment.value
  //     ? goToPost(post.value as Post, {
  //         replace: true,
  //       })
  //     : await router.replace(app_routes.home);
  // }
}

async function findPostById(id: string) {
  post.value = (await postsStore.findPostById(id)) as Post;
}

onMounted(async () => {
  if (route.query.id) await findPostById(route.query.id as string);
});
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

    <PostsAddMedia v-model:media="post.media" />

    <div class="mt-4 flex space-x-4 justify-end">
      <button :disabled="globalStore.api_loading" type="button" class="btn-primary-outline text-white !px-8 rounded-md" @click="createPost('draft')">
        {{ t("posts.draft") }}
      </button>
      <button :disabled="globalStore.api_loading" type="button" class="btn-primary text-white !px-8 rounded-md" @click="createPost('publish')">
        {{ is_comment ? t("posts.reply") : t("posts.publish") }}
      </button>
    </div>
  </div>
</template>
