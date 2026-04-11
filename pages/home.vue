<script lang="ts" setup>
import { usePostsStore } from "~/store/posts";
import { useGlobalStore } from "~/store/global";
import AppInfiniteScroll from "~/components/app/AppInfiniteScroll.vue";

definePageMeta({
  layout: "social",
});

const { t } = useI18n();
const postsStore = usePostsStore();
const { getFeed } = postsStore;
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const is_fetching = ref(true);
const take = ref(10);
const feed_exhausted = ref(false);
const fetch_in_flight = ref(false);
const $is_production = computed(() => process.env.NODE_ENV === "production");

async function fetchFeed() {
  if (feed_exhausted.value || fetch_in_flight.value) return;
  try {
    fetch_in_flight.value = true;
    is_fetching.value = true;
    const skip = postsStore.feed.length;
    const result = await getFeed({
      take: take.value,
      skip,
    });
    if (result && result.received < take.value) {
      feed_exhausted.value = true;
    }
  } catch {
    /* snack from store */
  } finally {
    is_fetching.value = false;
    fetch_in_flight.value = false;
  }
}

onBeforeMount(() => {
  page_title.value = t("home.page_title");
  void fetchFeed();
});
</script>

<template>
  <div>
    <div ref="scroll_element">
      <PostsSocialPost
        v-for="post in postsStore.feed"
        :key="post.id"
        :post="post"
        :is-fetching="is_fetching && postsStore.feed.length < 1"
      />
      <AppInfiniteScroll :loading="is_fetching" @intersected="fetchFeed" />
      <div v-if="$is_production">
        <MiscAdSense
          ad-client="ca-pub-1394318571803623"
          ad-slot="9356452207"
          ad-format="fluid"
          ad-layout-key="+2s+qu-5-33+f0"
        />
      </div>
    </div>
    <AppSpacerY size="md" />
  </div>
</template>
