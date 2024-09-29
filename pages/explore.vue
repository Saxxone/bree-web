<script lang="ts" setup>
import { HTMLInputType } from "~/types/types";
import { useGlobalStore } from "~/store/global";
import { useAuthStore } from "~/store/auth";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";

definePageMeta({
  layout: "social",
});

const globalStore = useGlobalStore();
const postsStore = usePostsStore();
const { t } = useI18n();
const search = ref("");
const posts = ref<Post[]>([]);
const scroll_element = ref<HTMLElement | null>(null);
const is_loading = ref(false);
const search_complete = ref(false);
const take = ref(35);
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);
const show = computed(() => !posts.value.length && search.value.length && !is_loading.value && search_complete.value);

const { reset } = useInfiniteScroll(
  scroll_element,
  async () => {
    // is_loading.value = true;
    // current_page.value++;
    // await useDynamicScroll(scroll_element.value as HTMLElement, getUserPosts);
    // is_loading.value = false;
  },
  { distance: 10000000 }
);

async function getSearchResults() {
  search_complete.value = false;
  is_loading.value = true;
  posts.value = await postsStore.getSearchResults(search.value, { cursor: posts.value[0]?.id, take: take.value, skip: skip.value });
  search_complete.value = true;
  is_loading.value = false;
}

onMounted(() => {
  globalStore.page_name = "";
});
</script>

<template>
  <div>
    <Teleport to="#top-bar" defer>
      <div>
        <FormsFormInput
          @keyup.enter="getSearchResults"
          v-model="search"
          name="search"
          :input-type="HTMLInputType.Text"
          class="!p-2 border mx-2 !mb-0"
          focus
          :placeholder="t('search.placeholder')" />
      </div>
    </Teleport>

    <div class="pt-6">
      <div v-if="show" class="my-auto text-center">{{ t("search.empty") }}</div>
      <div ref="scroll_element" v-else>
        <PostsSocialPost v-for="post in posts" :key="post.id" :post="post" />
      </div>
    </div>
  </div>
</template>
