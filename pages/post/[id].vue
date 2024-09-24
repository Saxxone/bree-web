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
const comments = ref<Post[]>([]);

async function findPostById(id: string) {
  await postsStore.findPostById(id);
  await getComments();
}

async function getComments() {
  if (postsStore.current_post?.id)
    comments.value = await postsStore.getComments(postsStore.current_post.id);
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

    <PostsSocialPost
      v-if="postsStore.current_post?.id"
      :key="postsStore.current_post.id"
      :post="postsStore.current_post"
    />

    <div v-if="comments.length" class="mt-4 ml-4">
      <PostsSocialPost
        v-for="comment in comments"
        :key="comment.id"
        :post="comment"
      />
    </div>

    <PostsStartPost comment="true" />
  </div>
</template>
