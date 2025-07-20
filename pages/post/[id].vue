<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useRoute } from "vue-router";
import { useGlobalStore } from "~/store/global";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const postsStore = usePostsStore();
const { findPostById, getComments } = postsStore;
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const route = useRoute();
const post = ref<Post>();
const is_fetching = ref(false);
const is_fetching_parent = ref(false);
const is_fetching_comments = ref(false);
const parentPost = ref<Post>();
const comments = ref<Post[]>([]);
const take = ref(10);
const skip = ref(0);

async function attemptFindPostById(id: string) {
  try {
    is_fetching.value = true;
    post.value = await findPostById(id);
    if (post.value) {
      scrollToElement();
      if (post.value.parentId) {
        await getParentPost();
      }
      await doGetComments();
    }
  } finally {
    is_fetching.value = false;
  }
}

function scrollToElement() {
  const element = document.getElementById("main_post");
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

async function doGetComments() {
  if (!post.value?.id) return;
  try {
    is_fetching_comments.value = true;
    if (post.value?.commentCount)
      comments.value = await getComments(
        post.value.id,
        {
          cursor: comments.value[0]?.id,
          take: take.value,
          skip: skip.value,
        },
        comments.value,
      );
  } finally {
    is_fetching_comments.value = false;
  }
}

async function getParentPost() {
  if (!post.value?.parentId) return;
  try {
    is_fetching_parent.value = true;
    if (post.value?.parentId) {
      parentPost.value = await findPostById(post.value.parentId);
    }
    is_fetching_parent.value = false;
  } finally {
    is_fetching_parent.value = false;
  }
}

onBeforeMount(async () => {
  page_title.value = t("posts.post");
  attemptFindPostById(route.params.id as string);
});
</script>

<template>
  <div class="lg:pt-14">
    <div v-if="parentPost" class="mb-1">
      <PostsSocialPost
        :key="post?.parentId as string"
        :post="parentPost"
        :is-fetching="is_fetching_parent"
      />
      <Icon icon="ic:twotone-more-vert" class="text-sub my-4 text-2xl" />
    </div>

    <PostsSocialPost
      v-if="post?.id"
      id="main_post"
      :key="post.id"
      :show-all="true"
      :post="post"
      :is-fetching="is_fetching"
    />

    <div v-if="comments?.length" class="ml-3 mt-4">
      <PostsSocialPost
        v-for="comment in comments"
        :key="comment.id"
        :post="comment"
        :is-fetching="is_fetching_comments && comments.length < 1"
      />
      <AppInfiniteScroll
        :loading="is_fetching_comments"
        @intersected="getComments"
      />
    </div>
  </div>
</template>
