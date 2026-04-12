<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useApiConnect } from "~/composables/useApiConnect";
import { useAuthStore } from "~/store/auth";
import { useGlobalStore } from "~/store/global";
import type { PostMediaMetadata } from "~/types/post";
import { FetchMethod } from "~/types/types";
import api_routes from "~/utils/api_routes";
import {
  pickVideoPlaybackSource,
  resolvePlaybackUrl,
} from "~/utils/playbackUrl";
import { resolveMediaTypes } from "~/utils/postMedia";
import type { MediaType } from "~/types/types";

interface Props {
  media: string[];
  mediaPlayback?: (string | undefined)[];
  mediaMetadata?: (PostMediaMetadata | undefined)[];
  mediaTypes?: MediaType[];
  current: number;
  postId: string;
  pricedCostMinor?: number | null;
}

const props = defineProps<Props>();
const emit = defineEmits(["unlocked"]);
const route = useRoute();
const { t } = useI18n();
const globalStore = useGlobalStore();
const authStore = useAuthStore();
const { access_token } = storeToRefs(authStore);
const unlocking = ref(false);

function isPaywalledVideoAt(index: number): boolean {
  return props.mediaMetadata?.[index]?.paywalled === true;
}

function videoPlaybackSrc(index: number): string {
  if (isPaywalledVideoAt(index)) return "";
  const raw = pickVideoPlaybackSource(
    props.mediaPlayback?.[index],
    String(props.media[index] ?? ""),
  );
  return resolvePlaybackUrl(raw, access_token.value, {
    requiresAuth: props.mediaMetadata?.[index]?.requiresAuth,
    fileId: props.mediaMetadata?.[index]?.fileId,
  });
}

function imageMediaSrc(index: number): string {
  return resolvePlaybackUrl(props.media[index], access_token.value, {
    requiresAuth: props.mediaMetadata?.[index]?.requiresAuth,
    fileId: props.mediaMetadata?.[index]?.fileId,
  });
}

const current_media_index = ref(0);
function goLeft() {
  current_media_index.value--;
}

function goRight() {
  current_media_index.value++;
}

watch(
  () => props.current,
  (v) => {
    current_media_index.value = v;
  },
  { immediate: true },
);

const resolvedMediaTypes = computed(() =>
  resolveMediaTypes(props.media, props.mediaTypes, props.mediaMetadata),
);

async function onUnlockPaywalled() {
  if (!authStore.isAuthenticated) {
    globalStore.addSnack({
      type: "error",
      message: t("posts.paid_video_unlock_login"),
    });
    return;
  }
  unlocking.value = true;
  const res = await useApiConnect<null, { unlocked?: boolean }>(
    api_routes.coins.unlock(props.postId),
    FetchMethod.POST,
  );
  unlocking.value = false;
  if ("message" in res) {
    globalStore.addSnack({ ...res, type: "error" });
    return;
  }
  emit("unlocked");
}
</script>

<template>
  <div class="flex h-5/6 w-full items-center justify-center overflow-hidden">
    <TransitionGroup name="media" tag="div">
      <div
        v-for="(file, index) in media"
        :key="file + index + 'post_media_viewer'"
        class="relative flex h-full w-full items-center"
      >
        <div
          v-if="current_media_index > 0"
          class="arrow_button left-0"
          :class="[current_media_index === index ? '' : 'hide-item']"
          @click.prevent.stop="goLeft"
        >
          <Icon icon="line-md:arrow-left" class="text-md" />
        </div>

        <Transition>
          <div v-if="index === current_media_index" class="rounded-lg">
            <AppImageRender
              v-if="resolvedMediaTypes[index] === 'image'"
              :img="imageMediaSrc(index)"
            />

            <div
              v-else-if="
                resolvedMediaTypes[index] === 'video' &&
                isPaywalledVideoAt(index)
              "
              class="flex min-h-[min(50vh,24rem)] w-full max-w-md flex-col items-center justify-center gap-4 rounded-lg bg-gray-900/90 px-6 py-10 text-center"
            >
              <IconsLineCoins
                :size="40"
                class="text-purple-400 shrink-0"
                aria-hidden="true"
              />
              <p class="text-main text-sm font-medium">
                {{ t("posts.paid_video_viewer_locked") }}
              </p>
              <p
                v-if="props.pricedCostMinor != null"
                class="text-sub text-sm leading-relaxed"
              >
                {{
                  t("posts.paid_video_interstitial_cost", {
                    coins: props.pricedCostMinor,
                  })
                }}
              </p>
              <p v-else class="text-sub text-sm leading-relaxed">
                {{ t("posts.paid_video_interstitial_cost_unknown") }}
              </p>
              <button
                v-if="authStore.isAuthenticated"
                type="button"
                class="bg-purple-600 hover:bg-purple-700 rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                :disabled="unlocking"
                @click="onUnlockPaywalled"
              >
                {{ t("posts.paid_video_unlock_cta") }}
              </button>
              <NuxtLink
                v-else
                :to="{ path: '/login', query: { redirect: route.fullPath } }"
                class="bg-purple-600 hover:bg-purple-700 rounded-lg px-5 py-2.5 text-sm font-medium text-white no-underline"
              >
                {{ t("posts.paid_video_unlock_login") }}
              </NuxtLink>
            </div>
            <AppVideoRender
              v-else-if="resolvedMediaTypes[index] === 'video'"
              :controls="true"
              :autoplay="true"
              :video="videoPlaybackSrc(index)"
            />
          </div>
        </Transition>

        <div
          v-if="current_media_index < media.length - 1"
          class="arrow_button right-0"
          :class="[current_media_index === index ? '' : 'hide-item']"
          @click.prevent.stop="goRight"
        >
          <Icon icon="line-md:arrow-right" class="text-md" />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="postcss">
.arrow_button {
  @apply absolute top-1/2 z-50 mx-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-white;
}

.hide-item {
  transform: translateX(130px);
  position: absolute;
  top: 200px;
  @apply !hidden;
}

.media-enter-active,
.media-leave-active {
  transition: all 3s ease;
}
.media-enter-from,
.media-leave-to {
  opacity: 0;
  transform: translateX(130px);
}
</style>
