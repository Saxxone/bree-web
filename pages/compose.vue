<script lang="ts" setup>
import { HTMLInputType } from "~/types/types";
import { useI18n } from "vue-i18n";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import app_routes from "~/utils/routes";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const router = useRouter();
const default_post = {
  text: "",
  img: "",
};

const postsStore = usePostsStore();
const route = useRoute();
const is_comment = computed(() => route.query.id && route.query.comment);

const post = ref<Partial<Post>>({
  ...default_post,
});

function processPost(): Partial<Post> | undefined {
  if (!post.value) {
    return;
  } else if (post.value.text?.trim() === "" && !post.value?.img) return;

  if (is_comment.value) post.value.parentId;

  return post.value;
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
  post.value = await postsStore.findPostById(id);
}

onMounted(async () => {
  findPostById(route.query.id as string);
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

    <div v-if="is_comment && post.id">
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

    <div class="mt-4 flex space-x-4 justify-end">
      <button type="button" class="btn-primary-outline text-white !px-8 rounded-md" @click="createPost('draft')">
        {{ t("posts.draft") }}
      </button>
      <button type="button" class="btn-primary text-white !px-8 rounded-md" @click="createPost('publish')">
        {{ is_comment ? t("posts.reply") : t("posts.publish") }}
      </button>
    </div>
  </div>
</template>
