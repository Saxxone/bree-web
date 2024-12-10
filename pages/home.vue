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
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1394318571803623"
        crossorigin="anonymous"
      ></script>
      <ins
        class="adsbygoogle"
        style="display: block"
        data-ad-format="fluid"
        data-ad-layout-key="+2s+qu-5-33+f0"
        data-ad-client="ca-pub-1394318571803623"
        data-ad-slot="9356452207"
      ></ins>
      <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    </div>
    <AppSpacerY size="md" />
  </div>
</template>
