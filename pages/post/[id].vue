<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useRoute } from "vue-router";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import { useGlobalStore } from "~/store/global";

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

const main_post = ref<HTMLElement | null>(null);
const { y } = useScroll(main_post, {
  behavior: "smooth",
  offset: { top: 30, bottom: 30, right: 30, left: 30 },
});

async function attemptFindPostById(id: string) {
  try {
    is_fetching.value = true;
    post.value = await findPostById(id);
    if (post.value) {
      if (post.value.parentId) {
        await getParentPost();
      }
      await doGetComments();
    }
  } catch (error) {
    console.error("Error fetching post data:", error);
  } finally {
    is_fetching.value = false;
  }
}

async function doGetComments() {
  if (!post.value?.id) return;
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
  is_fetching_comments.value = false;
}

async function getParentPost() {
  if (!post.value?.parentId) return;
  is_fetching_parent.value = true;
  if (post.value?.parentId) {
    parentPost.value = await findPostById(post.value.parentId);
  }
  is_fetching_parent.value = false;
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
      <Icon icon="ic:twotone-more-vert" class="text-2xl text-sub my-4" />
    </div>

    <PostsSocialPost
      v-if="post?.id"
      ref="main_post"
      :key="post.id"
      :show-all="true"
      :post="post"
      :is-fetching="is_fetching"
    />

    <div v-if="comments?.length" class="mt-4 ml-3">
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
