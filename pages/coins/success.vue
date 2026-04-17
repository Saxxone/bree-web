<script setup lang="ts">
import {
  isApiError,
  isInsufficientCoinsError,
  useCoinsStore,
} from "~/store/coins";
import { useGlobalStore } from "~/store/global";
import { usePostsStore } from "~/store/posts";
import {
  clearCoinUnlockResume,
  readCoinUnlockResume,
} from "~/utils/coinCheckoutResume";
import app_routes from "~/utils/routes";

definePageMeta({
  layout: "base",
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const coinsStore = useCoinsStore();
const postsStore = usePostsStore();
const globalStore = useGlobalStore();

type PageStatus = "working" | "done" | "error" | "timeout";

const status = ref<PageStatus>("working");
const errorMessage = ref("");

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function retryUnlockOnce() {
  const resume = readCoinUnlockResume();
  if (!resume?.postId) return;
  status.value = "working";
  errorMessage.value = "";
  const mediaIndex = Number.isFinite(resume.mediaIndex)
    ? Number(resume.mediaIndex)
    : 0;
  const res = await coinsStore.unlockPost(resume.postId);
  if (!isApiError(res)) {
    try {
      const fresh = await postsStore.findPostById(resume.postId, {
        network: true,
      });
      postsStore.mergePostFromServer(fresh);
    } catch {
      /* findPostById surfaces snack */
    }
    clearCoinUnlockResume();
    status.value = "done";
    await router.replace({
      path: app_routes.post.view_media,
      query: { postId: resume.postId, media: mediaIndex },
    });
    return;
  }
  if (isInsufficientCoinsError(res)) {
    status.value = "timeout";
    globalStore.addSnack({
      type: "info",
      message: t("coins.success_still_processing"),
    });
    return;
  }
  errorMessage.value = res.message;
  status.value = "error";
}

onMounted(async () => {
  if (!import.meta.client) return;

  const resume = readCoinUnlockResume();

  if (resume?.postId) {
    const mediaIndex = Number.isFinite(resume.mediaIndex)
      ? Number(resume.mediaIndex)
      : 0;
    for (let i = 0; i < 30; i++) {
      const res = await coinsStore.unlockPost(resume.postId);
      if (!isApiError(res)) {
        try {
          const fresh = await postsStore.findPostById(resume.postId, {
            network: true,
          });
          postsStore.mergePostFromServer(fresh);
        } catch {
          /* findPostById surfaces snack */
        }
        clearCoinUnlockResume();
        status.value = "done";
        await router.replace({
          path: app_routes.post.view_media,
          query: { postId: resume.postId, media: mediaIndex },
        });
        return;
      }
      if (!isInsufficientCoinsError(res)) {
        errorMessage.value = res.message;
        status.value = "error";
        return;
      }
      await sleep(1500);
    }
    status.value = "timeout";
    return;
  }

  if (resume?.profileUserId) {
    const uid = resume.profileUserId;
    clearCoinUnlockResume();
    await coinsStore.fetchBalance();
    status.value = "done";
    await router.replace(app_routes.profile.view(uid));
    return;
  }

  if (route.query.session_id) {
    await coinsStore.fetchBalance();
  }
  clearCoinUnlockResume();
  status.value = "done";
});
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-12 text-center">
    <template v-if="status === 'working'">
      <p class="text-main text-lg font-medium">
        {{ t("coins.success_working") }}
      </p>
      <p class="text-muted mt-2 text-sm">
        {{ t("coins.success_working_hint") }}
      </p>
    </template>

    <template v-else-if="status === 'done'">
      <p class="text-main text-lg font-medium">
        {{ t("coins.success_generic_title") }}
      </p>
      <NuxtLink
        :to="app_routes.home"
        class="text-violet-600 mt-4 inline-block text-sm font-medium"
      >
        {{ t("coins.success_back_home") }}
      </NuxtLink>
    </template>

    <template v-else-if="status === 'error'">
      <p class="text-main text-lg font-medium">
        {{ t("coins.success_error_title") }}
      </p>
      <p class="text-muted mt-2 text-sm">{{ errorMessage }}</p>
      <NuxtLink
        :to="app_routes.home"
        class="text-violet-600 mt-6 inline-block text-sm font-medium"
      >
        {{ t("coins.success_back_home") }}
      </NuxtLink>
    </template>

    <template v-else>
      <p class="text-main text-lg font-medium">
        {{ t("coins.success_timeout_title") }}
      </p>
      <p class="text-muted mt-2 text-sm">
        {{ t("coins.success_timeout_hint") }}
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          class="bg-violet-600 hover:bg-violet-700 rounded-lg px-4 py-2 text-sm font-medium text-white"
          @click="retryUnlockOnce"
        >
          {{ t("coins.success_retry_unlock") }}
        </button>
        <NuxtLink
          :to="app_routes.home"
          class="text-violet-600 rounded-lg px-4 py-2 text-sm font-medium"
        >
          {{ t("coins.success_back_home") }}
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
