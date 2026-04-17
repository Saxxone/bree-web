<script setup lang="ts">
import { usePostMediaGridClasses } from "~/composables/usePostMediaGridClasses";
import { useAuthStore } from "~/store/auth";
import {
  isApiError,
  isInsufficientCoinsError,
  useCoinsStore,
} from "~/store/coins";
import { useGlobalStore } from "~/store/global";
import { usePostsStore } from "~/store/posts";
import type { PostMediaMetadata } from "~/types/post";
import type { MediaType } from "~/types/types";
import {
  pickVideoPlaybackSource,
  resolvePlaybackUrl,
} from "~/utils/playbackUrl";
import { resolveMediaTypes } from "~/utils/postMedia";
import app_routes from "~/utils/routes";

interface Props {
  media: string[];
  mediaPlayback?: string[];
  mediaMetadata?: PostMediaMetadata[];
  mediaTypes?: MediaType[];
  postId: string;
  monetizationEnabled?: boolean;
  pricedCostMinor?: number | null;
  paidVideoClickInterstitial?: boolean;
  /** Mute/unmute control on inline autoplay videos (feed-style cards). */
  showVideoMuteToggle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mediaPlayback: undefined,
  mediaMetadata: undefined,
  mediaTypes: undefined,
  monetizationEnabled: false,
  pricedCostMinor: null,
  paidVideoClickInterstitial: true,
  showVideoMuteToggle: true,
});

const router = useRouter();
const { t } = useI18n();
const globalStore = useGlobalStore();
const authStore = useAuthStore();
const coinsStore = useCoinsStore();
const postsStore = usePostsStore();
const { access_token } = storeToRefs(authStore);

const unlockConfirmLoading = ref(false);

function isPaywalledVideoAt(index: number): boolean {
  return props.mediaMetadata?.[index]?.paywalled === true;
}

/** Public CDN / signed URLs: safe to render during SSR. Token-backed URLs: client-only to avoid a tokenless URL then a reload after hydration. */
function videoPlaybackIsPublic(index: number): boolean {
  return props.mediaMetadata?.[index]?.requiresAuth === false;
}

function videoPlaybackSrc(index: number): string {
  if (isPaywalledVideoAt(index)) return "";
  const raw = pickVideoPlaybackSource(
    props.mediaPlayback?.[index],
    props.media[index] as string,
  );
  return resolvePlaybackUrl(raw, access_token.value, {
    requiresAuth: props.mediaMetadata?.[index]?.requiresAuth,
    fileId: props.mediaMetadata?.[index]?.fileId,
  });
}

function imageMediaSrc(index: number): string {
  return resolvePlaybackUrl(props.media[index] as string, access_token.value, {
    requiresAuth: props.mediaMetadata?.[index]?.requiresAuth,
    fileId: props.mediaMetadata?.[index]?.fileId,
  });
}

const dynamicGridClasses = usePostMediaGridClasses(() => props.media.length);

const resolvedMediaTypes = computed(() =>
  resolveMediaTypes(props.media, props.mediaTypes, props.mediaMetadata),
);

const interstitialOpen = ref(false);
const pendingMediaIndex = ref<number | null>(null);
const topUpOpen = ref(false);
const interstitialBalanceMinor = ref<number | null>(null);

function needsPaidUnlockInterstitialAt(index: number): boolean {
  if (resolvedMediaTypes.value[index] !== "video") return false;
  if (props.mediaMetadata?.[index]?.paywalled === true) return true;
  const playback = props.mediaPlayback?.[index]?.trim() ?? "";
  if (playback) return false;
  if (props.mediaMetadata?.[index]?.requiresAuth === false) return false;
  return props.monetizationEnabled === true;
}

async function goToMediaViewer(index: number) {
  await router.push({
    path: app_routes.post.view_media,
    query: { media: index, postId: props.postId },
  });
}

async function selectMedia(index: number) {
  if (
    props.paidVideoClickInterstitial &&
    needsPaidUnlockInterstitialAt(index)
  ) {
    pendingMediaIndex.value = index;
    interstitialOpen.value = true;
    return;
  }
  await goToMediaViewer(index);
}

watch(interstitialOpen, async (open) => {
  if (!open || !props.paidVideoClickInterstitial) return;
  const idx = pendingMediaIndex.value;
  if (idx == null) return;

  interstitialBalanceMinor.value = null;
  if (authStore.isAuthenticated) {
    const bal = await coinsStore.fetchBalance();
    if (
      interstitialOpen.value &&
      pendingMediaIndex.value === idx &&
      !isApiError(bal)
    ) {
      interstitialBalanceMinor.value = bal.balanceMinor;
    }
  }

  const q = await coinsStore.quotePost(props.postId);
  if (!interstitialOpen.value || pendingMediaIndex.value !== idx) return;
  if (isApiError(q)) return;

  if (q.alreadyUnlocked && authStore.isAuthenticated) {
    try {
      const fresh = await postsStore.findPostById(props.postId, {
        network: true,
      });
      postsStore.mergePostFromServer(fresh);
      interstitialOpen.value = false;
      pendingMediaIndex.value = null;
      await goToMediaViewer(idx);
    } catch {
      /* findPostById already surfaced snack */
    }
  }
});

async function onInterstitialConfirm() {
  const i = pendingMediaIndex.value;
  if (i == null) return;
  if (!authStore.isAuthenticated) {
    globalStore.addSnack({
      type: "error",
      message: t("posts.paid_video_unlock_login"),
    });
    return;
  }

  unlockConfirmLoading.value = true;
  try {
    const res = await coinsStore.unlockPost(props.postId);
    if (isApiError(res)) {
      if (isInsufficientCoinsError(res)) {
        globalStore.addSnack({
          type: "info",
          message: t("coins.insufficient_hint"),
        });
        topUpOpen.value = true;
        return;
      }
      globalStore.addSnack({
        type: "error",
        message: res.message,
      });
      return;
    }
    const fresh = await postsStore.findPostById(props.postId, {
      network: true,
    });
    postsStore.mergePostFromServer(fresh);
    interstitialOpen.value = false;
    pendingMediaIndex.value = null;
    await goToMediaViewer(i);
  } catch {
    /* findPostById already surfaced snack */
  } finally {
    unlockConfirmLoading.value = false;
  }
}
</script>

<template>
  <PostsPaidVideoFeedInterstitial
    v-model="interstitialOpen"
    :priced-cost-minor="props.pricedCostMinor"
    :balance-minor="interstitialBalanceMinor"
    :loading="unlockConfirmLoading"
    @confirm="onInterstitialConfirm"
  />
  <AppCoinTopUpModal
    v-model="topUpOpen"
    :resume="{
      postId: props.postId,
      mediaIndex: pendingMediaIndex ?? 0,
    }"
  />
  <div>
    <AppSpacerY size="xxs" />
    <div
      class="h-64 overflow-hidden rounded-lg lg:h-96"
      :class="dynamicGridClasses"
    >
      <div
        v-for="(url, index) in props.media"
        :key="url as string"
        class="h-full cursor-pointer overflow-hidden"
        :class="{
          'row-span-2': index === 0 && props.media.length === 3,
          'row-span-1': index >= 1 && index <= 2 && props.media.length === 3,
        }"
        @click.prevent.stop="selectMedia(index)"
      >
        <AppImageRender
          v-if="resolvedMediaTypes[index] === 'image'"
          :img="imageMediaSrc(index)"
        />
        <div
          v-else-if="
            resolvedMediaTypes[index] === 'video' && isPaywalledVideoAt(index)
          "
          class="bg-base-dark/90 flex h-full w-full flex-col items-center justify-center gap-2 p-2"
        >
          <IconsLineCoins
            :size="32"
            class="text-violet-400 shrink-0"
            aria-hidden="true"
          />
          <span
            class="text-muted text-center text-xs font-medium leading-tight"
          >
            {{ t("posts.paid_video_viewer_locked") }}
          </span>
        </div>
        <AppVideoRender
          v-else-if="
            resolvedMediaTypes[index] === 'video' &&
            videoPlaybackIsPublic(index)
          "
          :video="videoPlaybackSrc(index)"
          :controls="false"
          :autoplay="true"
          :show-mute-toggle="props.showVideoMuteToggle"
        />
        <ClientOnly v-else-if="resolvedMediaTypes[index] === 'video'">
          <template #fallback>
            <div
              class="bg-base-dark/25 h-full w-full animate-pulse"
              aria-hidden="true"
            />
          </template>
          <AppVideoRender
            :video="videoPlaybackSrc(index)"
            :controls="false"
            :autoplay="true"
            :show-mute-toggle="props.showVideoMuteToggle"
          />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>
