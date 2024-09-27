<script setup lang="ts">
import { useRoute } from "vue-router";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import { useInfiniteScroll, useScroll } from "@vueuse/core";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const postsStore = usePostsStore();
const route = useRoute();
const post = ref<Post>();
const parentPost = ref<Post>();
const comments = ref<Post[]>([]);
const take = ref(10);
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);
const scroll_element = ref<HTMLElement | null>(null);
const main_post = ref<HTMLElement | null>(null);
const { x, y, isScrolling, arrivedState, directions } = useScroll(main_post, {
  behavior: "smooth",
  offset: { top: 30, bottom: 30, right: 30, left: 30 },
});

const { reset } = useInfiniteScroll(
  scroll_element,
  () => {
    // loadMore();
  },
  { distance: 10 }
);

function loadMore() {
  current_page.value++;
  getComments();
}

async function findPostById(id: string) {
  post.value = await postsStore.findPostById(id);
  await getParentPost();
  await getComments();
  y.value = -100000;
}

async function getComments() {
  if (post.value?.id)
    comments.value = await postsStore.getComments(
      post.value.id,
      {
        cursor: comments.value[0]?.id,
        take: take.value,
        skip: skip.value,
      },
      comments.value
    );
}

async function getParentPost() {
  if (post.value?.parentId) {
    parentPost.value = await postsStore.findPostById(post.value.parentId);
  }
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

    <div v-if="parentPost?.id" class="mb-1">
      <PostsSocialPost :key="parentPost.id" :post="parentPost" />
      <span class="material-symbols-rounded filled text-gray-400"> more_vert </span>
    </div>

    <div ref="main_post">
      <PostsSocialPost v-if="post?.id" :key="post.id" :post="post" />
    </div>

    <div v-if="comments?.length" class="mt-4 ml-4" ref="scroll_element">
      <PostsSocialPost v-for="comment in comments" :key="comment.id" :post="comment" />
    </div>

    <PostsStartPost comment="true" />
  </div>
</template>
