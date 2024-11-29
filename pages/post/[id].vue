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
const parentPost = ref<Post>();
const comments = ref<Post[]>([]);
const take = ref(10);
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);

const main_post = ref<HTMLElement | null>(null);
const { y } = useScroll(main_post, {
  behavior: "smooth",
  offset: { top: 30, bottom: 30, right: 30, left: 30 },
});

async function attemptFindPostById(id: string) {
  post.value = await findPostById(id);
  await getParentPost();
  await doGetComments();
  y.value = -100000;
}

async function doGetComments() {
  if (post.value?.id)
    comments.value = await getComments(
      post.value.id,
      {
        cursor: comments.value[0]?.id,
        take: take.value,
        skip: skip.value,
      },
      comments.value,
    );
}

async function getParentPost() {
  if (post.value?.parentId) {
    parentPost.value = await findPostById(post.value.parentId);
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
      <PostsSocialPost :key="post?.parentId" :post="parentPost" />
      <Icon icon="ic:twotone-more-vert" class="text-2xl text-sub my-4" />
    </div>

    <PostsSocialPost
      ref="main_post"
      v-if="post?.id"
      :key="post.id"
      :show-all="true"
      :post="post"
    />

    <div v-if="comments?.length" ref="scroll_element" class="mt-4 ml-4">
      <PostsSocialPost
        v-for="comment in comments"
        :key="comment.id"
        :post="comment"
      />
    </div>

    <PostsStartPost comment="true" />
  </div>
</template>
