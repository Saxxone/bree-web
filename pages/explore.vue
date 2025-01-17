<script lang="ts" setup>
import { HTMLInputType } from "~/types/types";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import { useGlobalStore } from "~/store/global";

definePageMeta({
  layout: "social",
});

const { t } = useI18n();

const top_bar = ref<HTMLElement | null>(null);
const postsStore = usePostsStore();
const { getSearchResults } = postsStore;
const globalStore = useGlobalStore();
const { api_loading, page_title } = storeToRefs(globalStore);
const router = useRouter();
const search = ref("");
const posts = ref<Post[]>([]);
const loaded = ref(false);
const search_complete = ref(false);
const take = ref(10);
const skip = ref(0);
const show = computed(
  () =>
    !posts.value?.length &&
    search.value?.length &&
    !api_loading.value &&
    search_complete.value,
);

async function fetchSearchResults() {
  try {
    skip.value += take.value;
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
  } catch {
    search_complete.value = true;
  }
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

  top_bar.value = document.getElementById("top-bar");
  loaded.value = true;
});

onBeforeMount(() => {
  page_title.value = t("explore.page_title");
});
</script>

<template>
  <div class="pt-6">
    <div v-if="loaded">
      <Teleport :to="top_bar">
        <div class="w-full mx-4">
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
      </Teleport>
    </div>

    <AppEmptyData v-if="show" :message="t('explore.no_results')" />
    <div v-else ref="scroll_element">
      <PostsSocialPost
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :is-fetching="!search_complete && posts.length < 1"
      />
      <AppInfiniteScroll
        :loading="!search_complete"
        @intersected="fetchSearchResults"
      />
    </div>
  </div>
</template>
