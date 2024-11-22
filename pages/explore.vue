<script lang="ts" setup>
import { HTMLInputType } from "~/types/types";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import { useGlobalStore } from "~/store/global";

definePageMeta({
  layout: "social",
});

const { t } = useI18n();

const postsStore = usePostsStore();
const { getSearchResults } = postsStore;
const globalStore = useGlobalStore();
const { api_loading, page_title } = storeToRefs(globalStore);
const router = useRouter();
const search = ref("");
const posts = ref<Post[]>([]);

const search_complete = ref(false);
const take = ref(35);
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);
const show = computed(
  () =>
    !posts.value?.length &&
    search.value?.length &&
    !api_loading.value &&
    search_complete.value,
);

async function fetchSearchResults() {
  const q = search.value
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(" ")
    .join("+") as string;
  search_complete.value = false;

  router.push({
    query: {
      q: encodeURIComponent(q),
    },
  });
  posts.value = await getSearchResults(q, {
    cursor: posts.value?.[0]?.id,
    take: take.value,
    skip: skip.value,
  });
  search_complete.value = true;
}

watchDebounced(
  () => search.value,
  async () => {
    if (!search.value?.length) return;
    await fetchSearchResults();
  },
  { debounce: 1000 },
);

onMounted(() => {
  if (router.currentRoute.value.query.q) {
    search.value = decodeURIComponent(
      router.currentRoute.value.query.q as string,
    );
    fetchSearchResults();
  }
});

onBeforeMount(() => {
  page_title.value = t("explore.page_title");
});
</script>

<template>
  <div>
    <main class="bg-base-light py-6 lg:py-0 min-h-dvh overflow-y-hidden">
      <div class="container pt-14 lg:py-0">
        <div class="fixed top-0 w-full left-0 z-50">
          <div class="flex items-center p-4">
            <AppGoBack class="w-16" />

            <div id="top-bar" class="w-full mx-4">
              <FormsFormInput
                v-model="search"
                :default-value="search"
                name="search"
                :input-type="HTMLInputType.Text"
                class="!px-2 !py-2.5 border mx-2 !mb-0"
                focus
                :placeholder="t('explore.placeholder')"
                @keyup.enter="getSearchResults"
              />
            </div>

            <div class="px-2 cursor-pointer">
              <span class="material-symbols-rounded text-2xl"> more_vert </span>
            </div>
          </div>
        </div>

        <div class="lg:grid grid-cols-12 lg:gap-4">
          <section class="col-span-3">
            <AppLeftSideBar />
          </section>
          <section
            class="col-span-6 overflow-y-scroll scroll-bar-none h-dvh relative"
          >
            <div class="pt-6">
              <AppEmptyData v-if="show" :message="t('explore.no_results')" />
              <div v-else ref="scroll_element">
                <PostsSocialPost
                  v-for="post in posts"
                  :key="post.id"
                  :post="post"
                />
              </div>
            </div>
            <PostsStartPost />
          </section>
          <section class="col-span-3">
            <AppRightSideBar />
          </section>
        </div>
      </div>

      <AppBottomBar class="fixed bottom-0 lg:hidden" />
    </main>
  </div>
</template>
