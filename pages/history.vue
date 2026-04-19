<script lang="ts" setup>
import { useApiConnect } from "~/composables/useApiConnect";
import { useAuthStore } from "~/store/auth";
import { useGlobalStore } from "~/store/global";
import type { Post } from "~/types/post";
import { FetchMethod } from "~/types/types";
import api_routes from "~/utils/api_routes";
import app_routes from "~/utils/routes";
import { postsPaginationQuery } from "~/utils/postsPaginationQuery";

definePageMeta({
  layout: "social",
});

const { t } = useI18n();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);

type HistoryTab = "history" | "liked" | "paid";

const active_tab = ref<HistoryTab>("history");
const posts = ref<Post[]>([]);
const take = 10;
const exhausted = ref(false);
const fetch_in_flight = ref(false);

const tab_endpoint = computed(() => {
  switch (active_tab.value) {
    case "history":
      return api_routes.posts.myWatchHistory;
    case "liked":
      return api_routes.posts.myLikedVideos;
    default:
      return api_routes.posts.myUnlocked;
  }
});

async function loadPosts(reset: boolean) {
  if (!authStore.isAuthenticated || fetch_in_flight.value) return;
  if (!reset && exhausted.value) return;
  fetch_in_flight.value = true;
  try {
    const skip = reset ? 0 : posts.value.length;
    const qs = postsPaginationQuery({ skip, take });
    const url = `${tab_endpoint.value}?${qs}`;
    const response = await useApiConnect<null, Post[]>(url, FetchMethod.GET);
    if ("message" in response) {
      globalStore.addSnack({ ...response });
      if (reset) posts.value = [];
      exhausted.value = true;
      return;
    }
    if (reset) {
      posts.value = [...response];
    } else {
      const ids = new Set(posts.value.map((p) => p.id));
      for (const p of response) {
        if (!ids.has(p.id)) {
          posts.value.push(p);
          ids.add(p.id);
        }
      }
    }
    exhausted.value = response.length < take;
  } finally {
    fetch_in_flight.value = false;
  }
}

watch(active_tab, () => {
  posts.value = [];
  exhausted.value = false;
  void loadPosts(true);
});

onBeforeMount(() => {
  page_title.value = t("history.page_title");
});

onMounted(() => {
  if (authStore.isAuthenticated) {
    void loadPosts(true);
  }
});
</script>

<template>
  <div class="pt-6">
    <div
      class="border-base-dark mb-4 flex gap-1 rounded-lg border p-1 sm:inline-flex"
      role="tablist"
    >
      <button
        type="button"
        role="tab"
        :aria-selected="active_tab === 'history'"
        class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
        :class="
          active_tab === 'history'
            ? 'bg-violet-600 text-white'
            : 'text-sub hover:bg-gray-800'
        "
        @click="active_tab = 'history'"
      >
        {{ t("history.tab_history") }}
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="active_tab === 'liked'"
        class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
        :class="
          active_tab === 'liked'
            ? 'bg-violet-600 text-white'
            : 'text-sub hover:bg-gray-800'
        "
        @click="active_tab = 'liked'"
      >
        {{ t("history.tab_liked") }}
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="active_tab === 'paid'"
        class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
        :class="
          active_tab === 'paid'
            ? 'bg-violet-600 text-white'
            : 'text-sub hover:bg-gray-800'
        "
        @click="active_tab = 'paid'"
      >
        {{ t("history.tab_paid") }}
      </button>
    </div>

    <div
      v-if="!authStore.isAuthenticated"
      class="text-sub px-2 py-8 text-center"
    >
      <p class="mb-4">{{ t("history.login_prompt") }}</p>
      <NuxtLink
        :to="{
          path: app_routes.login,
          query: { redirect: app_routes.history },
        }"
        class="text-violet-500 font-medium underline"
      >
        {{ t("login.login") }}
      </NuxtLink>
    </div>

    <template v-else>
      <AppEmptyData
        v-if="!fetch_in_flight && !posts.length"
        :message="
          active_tab === 'history'
            ? t('history.empty_history')
            : active_tab === 'liked'
              ? t('history.empty_liked')
              : t('history.empty_paid')
        "
      />
      <div v-else>
        <PostsSocialPost
          v-for="p in posts"
          :key="p.id"
          :post="p"
          :is-fetching="false"
          :feed-trailer-autoplay="true"
        />
        <AppInfiniteScroll
          :loading="fetch_in_flight"
          @intersected="loadPosts(false)"
        />
      </div>
    </template>
  </div>
</template>
