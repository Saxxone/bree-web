<script lang="ts" setup>
import { usePostsStore } from "~/store/posts";
import { useGlobalStore } from "~/store/global";

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
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);
const $is_production = computed(() => process.env.NODE_ENV === "production");

async function fetchFeed() {
  is_fetching.value = true;
  await getFeed({
    cursor: postsStore.feed?.[0]?.id,
    take: take.value,
    skip: skip.value,
  });
  is_fetching.value = false;
}

onBeforeMount(async () => {
  page_title.value = t("home.page_title");
  fetchFeed();
});
</script>

<template>
  <div>
    <div ref="scroll_element">
      <PostsSocialPost
        v-for="post in postsStore.feed"
        :key="post.id"
        :post="post"
        :is-fetching="is_fetching"
      />
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
