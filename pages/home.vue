<script lang="ts" setup>
import { useVirtualizer, measureElement } from "@tanstack/vue-virtual";
import { usePostsStore } from "~/store/posts";
import { useGlobalStore } from "~/store/global";
import AppInfiniteScroll from "~/components/app/AppInfiniteScroll.vue";
import { socialMainScrollElKey } from "~/utils/socialMainScrollEl";

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

const mainScrollEl = inject(socialMainScrollElKey);
if (!mainScrollEl) {
  throw new Error("home requires social layout (socialMainScrollElKey)");
}

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: postsStore.feed.length,
    getScrollElement: () => mainScrollEl.value,
    estimateSize: () => 420,
    overscan: 6,
    measureElement,
    getItemKey: (index: number) => postsStore.feed[index]?.id ?? index,
  })),
);

const virtualItems = computed(() => rowVirtualizer.value.getVirtualItems());
const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

function measureRow(el: Element | null) {
  if (el instanceof HTMLElement) {
    rowVirtualizer.value.measureElement(el);
  }
}

watch(
  () => [postsStore.feed.length, postsStore.feed[0]?.id] as const,
  () => {
    nextTick(() => {
      rowVirtualizer.value.measure();
    });
  },
);

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
    <div class="relative w-full" :style="{ height: `${totalSize}px` }">
      <div
        v-for="virtualRow in virtualItems"
        :key="String(virtualRow.key)"
        :ref="(el) => measureRow(el as Element | null)"
        class="absolute left-0 top-0 w-full"
        :data-index="virtualRow.index"
        :style="{ transform: `translateY(${virtualRow.start}px)` }"
      >
        <PostsSocialPost
          v-if="postsStore.feed[virtualRow.index]"
          :post="postsStore.feed[virtualRow.index]!"
          :is-fetching="is_fetching && postsStore.feed.length < 1"
          :feed-trailer-autoplay="true"
        />
      </div>
    </div>
    <AppInfiniteScroll :loading="is_fetching" @intersected="fetchFeed" />
    <div v-if="$is_production">
      <MiscAdSense
        ad-client="ca-pub-1394318571803623"
        ad-slot="9356452207"
        ad-format="fluid"
        ad-layout-key="+2s+qu-5-33+f0"
      />
    </div>
    <AppSpacerY size="md" />
  </div>
</template>
