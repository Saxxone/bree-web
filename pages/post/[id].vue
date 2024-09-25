<script setup lang="ts">
import { useRoute } from "vue-router";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";

definePageMeta({
  layout: "social",
});

const { t } = useI18n();
const postsStore = usePostsStore();
const route = useRoute();
const post = ref<Post>();
const comments = ref<Post[]>([]);

async function findPostById(id: string) {
  post.value = await postsStore.findPostById(id);
  await getComments();
}

async function getComments() {
  if (post.value?.id) comments.value = await postsStore.getComments(post.value.id, comments.value);
}

onMounted(async () => {
  findPostById(route.params.id as string);
});
</script>

<template>
  <div>
    <div class="flex space-x-4 items-center mb-4">
      <AppGoBack />

      <h2 class="font-medium text-gray-600">
        {{ t("posts.post") }}
      </h2>
    </div>

    <PostsSocialPost v-if="post?.id" :key="post.id" :post="post" />

    <div v-if="comments?.length" class="mt-4 ml-4">
      <PostsSocialPost v-for="comment in comments" :key="comment.id" :post="comment" />
    </div>

    <PostsStartPost comment="true" />
  </div>
</template>
