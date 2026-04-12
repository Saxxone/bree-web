<script setup lang="ts">
import { useApiConnect } from "~/composables/useApiConnect";
import { useAuthStore } from "~/store/auth";
import { useGlobalStore } from "~/store/global";
import type { PostMediaMetadata } from "~/types/post";
import type { MediaType } from "~/types/types";
import { FetchMethod } from "~/types/types";
import api_routes from "~/utils/api_routes";
import app_routes from "~/utils/routes";
import {
  pickVideoPlaybackSource,
  resolvePlaybackUrl,
} from "~/utils/playbackUrl";
import { resolveMediaTypes } from "~/utils/postMedia";
import { usePostMediaGridClasses } from "~/composables/usePostMediaGridClasses";

interface Props {
  media: string[];
  mediaPlayback?: string[];
  mediaMetadata?: PostMediaMetadata[];
  mediaTypes?: MediaType[];
  postId: string;
  monetizationEnabled?: boolean;
  pricedCostMinor?: number | null;
  paidVideoClickInterstitial?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  monetizationEnabled: false,
  paidVideoClickInterstitial: true,
});

const router = useRouter();
const { t } = useI18n();
const globalStore = useGlobalStore();
const authStore = useAuthStore();
const { access_token } = storeToRefs(authStore);

function isPaywalledVideoAt(index: number): boolean {
  return props.mediaMetadata?.[index]?.paywalled === true;
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

async function onInterstitialConfirm() {
  const i = pendingMediaIndex.value;
  pendingMediaIndex.value = null;
  if (i == null) return;
  if (!authStore.isAuthenticated) {
    globalStore.addSnack({
      type: "error",
      message: t("posts.paid_video_unlock_login"),
    });
    return;
  }
  const res = await useApiConnect<null, { unlocked?: boolean }>(
    api_routes.coins.unlock(props.postId),
    FetchMethod.POST,
  );
  if ("message" in res) {
    globalStore.addSnack({ ...res, type: "error" });
    return;
  }
  await goToMediaViewer(i);
}
</script>

<template>
  <PostsPaidVideoFeedInterstitial
    v-model="interstitialOpen"
    :priced-cost-minor="props.pricedCostMinor"
    @confirm="onInterstitialConfirm"
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
            class="text-purple-400 shrink-0"
            aria-hidden="true"
          />
          <span
            class="text-muted text-center text-xs font-medium leading-tight"
          >
            {{ t("posts.paid_video_viewer_locked") }}
          </span>
        </div>
        <AppVideoRender
          v-else-if="resolvedMediaTypes[index] === 'video'"
          :video="videoPlaybackSrc(index)"
          :controls="false"
          :autoplay="true"
        />
      </div>
    </div>
  </div>
</template>
