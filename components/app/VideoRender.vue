<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import Hls from "hls.js";
import PlyrCtor from "plyr";
import "plyr/dist/plyr.css";

type PlyrInstance = InstanceType<typeof PlyrCtor>;

interface Props {
  video: string;
  controls?: boolean;
  autoplay?: boolean;
  /** Overlay mute/unmute (for feed cards: autoplay without Plyr controls). */
  showMuteToggle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showMuteToggle: false,
});

const { t } = useI18n();

const hostRef = ref<HTMLDivElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
const isVisible = ref(false);
/** Avoid tearing down Plyr / resetting `<video src>` when the effective URL is unchanged (duplicate watch/mount cycles). */
const lastBuiltVideoUrl = ref<string | null>(null);
/** When {@link Props.showMuteToggle} is true, user chose to hear feed autoplay. */
const feedUserWantsUnmuted = ref(false);

let observer: IntersectionObserver | null = null;
/** Feed autoplay: wait until the card is near the viewport before building Plyr/Hls. */
let deferredHostObserver: IntersectionObserver | null = null;
let plyrInstance: PlyrInstance | null = null;
let hlsInstance: Hls | null = null;

function isHlsUrl(url: string): boolean {
  return /\.m3u8(\?|#|$)/i.test(url.trim());
}

function destroyHls() {
  hlsInstance?.destroy();
  hlsInstance = null;
}

function clearPlyrProperty(el: HTMLVideoElement | null) {
  if (!el) return;
  Reflect.deleteProperty(el as unknown as Record<string, unknown>, "plyr");
}

/** Plyr's full destroy swaps in a clone; Vue's ref can still point at a detached `<video>`. */
function reconcileVideoAfterPlyrDestroy() {
  const root = hostRef.value;
  const vid = videoRef.value;
  if (!root || !vid || vid.isConnected) return;
  root.querySelector("video")?.remove();
  root.appendChild(vid);
  vid.removeAttribute("src");
  vid.load();
}

function destroyPlyr() {
  plyrInstance?.destroy();
  plyrInstance = null;
  reconcileVideoAfterPlyrDestroy();
}

/** Feed cards: autoplay must stay muted (browser policy + product expectation). */
function isFeedAutoplayMuted(): boolean {
  return props.autoplay === true && props.controls !== true;
}

const showMuteToggleUi = computed(
  () =>
    props.showMuteToggle === true &&
    props.autoplay === true &&
    props.controls !== true,
);

const muteToggleAriaLabel = computed(() =>
  feedUserWantsUnmuted.value ? t("posts.video_mute") : t("posts.video_unmute"),
);

function shouldForceFeedMute(): boolean {
  return (
    isFeedAutoplayMuted() &&
    !(props.showMuteToggle && feedUserWantsUnmuted.value)
  );
}

function enforceFeedMuted() {
  if (!shouldForceFeedMute()) return;
  const el = videoRef.value;
  if (!el || !plyrInstance) return;
  el.muted = true;
  el.volume = 0;
  (plyrInstance as unknown as { muted: boolean }).muted = true;
}

function onPlayUnmuteForFullPlayer() {
  if (!props.controls) return;
  const el = videoRef.value;
  if (!el || !plyrInstance) return;
  el.muted = false;
  (plyrInstance as unknown as { muted: boolean }).muted = false;
}

function onVolumeChangeEnforceFeedMuted() {
  if (!shouldForceFeedMute()) return;
  const el = videoRef.value;
  if (!el || (el.muted && el.volume === 0)) return;
  enforceFeedMuted();
}

function toggleFeedMute() {
  if (!showMuteToggleUi.value) return;
  feedUserWantsUnmuted.value = !feedUserWantsUnmuted.value;
  const el = videoRef.value;
  if (!el || !plyrInstance) return;
  if (feedUserWantsUnmuted.value) {
    el.muted = false;
    el.volume = 1;
    (plyrInstance as unknown as { muted: boolean }).muted = false;
  } else {
    el.muted = true;
    el.volume = 0;
    (plyrInstance as unknown as { muted: boolean }).muted = true;
  }
}

function teardownPlayer() {
  const el = videoRef.value;
  if (el) {
    el.removeEventListener("canplay", onCanPlay);
    el.removeEventListener("play", onPlayUnmuteForFullPlayer);
    el.removeEventListener("volumechange", onVolumeChangeEnforceFeedMuted);
  }
  destroyHls();
  destroyPlyr();
  if (el) {
    el.removeAttribute("src");
    el.load();
  }
  lastBuiltVideoUrl.value = null;
}

function attachHls(el: HTMLVideoElement, src: string) {
  destroyHls();
  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });
    hls.loadSource(src);
    hls.attachMedia(el);
    hlsInstance = hls;
  } else if (el.canPlayType("application/vnd.apple.mpegurl")) {
    el.src = src;
  } else {
    el.src = src;
  }
}

function syncPlayback() {
  const el = videoRef.value;
  if (!el || !props.autoplay) return;
  if (isVisible.value) {
    enforceFeedMuted();
    void el.play().catch(() => {});
    enforceFeedMuted();
  } else {
    el.pause();
  }
}

function disconnectObserver() {
  observer?.disconnect();
  observer = null;
}

function disconnectDeferredHostObserver() {
  deferredHostObserver?.disconnect();
  deferredHostObserver = null;
}

/** Feed-style muted autoplay: defer heavy player setup until visible. */
function shouldDeferPlayerInit(): boolean {
  return props.autoplay === true && props.controls !== true;
}

function connectObserver() {
  disconnectObserver();
  if (!props.autoplay) {
    videoRef.value?.pause();
    return;
  }
  const el = videoRef.value;
  if (!el) return;
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      isVisible.value = entry?.isIntersecting ?? false;
      syncPlayback();
    },
    { threshold: 0.2, rootMargin: "80px 0px" },
  );
  observer.observe(el);
}

function buildPlayer() {
  const el = videoRef.value;
  if (!el || !props.video) {
    teardownPlayer();
    return;
  }

  if (lastBuiltVideoUrl.value === props.video && plyrInstance) {
    connectObserver();
    syncPlayback();
    return;
  }

  teardownPlayer();
  if (!videoRef.value || !props.video) return;
  const el2 = videoRef.value;
  clearPlyrProperty(el2);

  el2.muted = true;
  if (isFeedAutoplayMuted()) {
    el2.volume = 0;
  }
  el2.setAttribute("playsinline", "");
  el2.setAttribute("webkit-playsinline", "");

  if (isHlsUrl(props.video)) {
    attachHls(el2, props.video);
  } else {
    el2.src = props.video;
  }

  plyrInstance = new PlyrCtor(el2, {
    ...(props.controls ? {} : { controls: [] }),
    muted: true,
    ...(isFeedAutoplayMuted() ? { volume: 0 } : {}),
    loop: { active: true },
    autoplay: false,
    clickToPlay: props.controls,
    hideControls: !!props.controls,
    resetOnEnd: false,
  });

  el2.addEventListener("canplay", onCanPlay);
  el2.addEventListener("play", onPlayUnmuteForFullPlayer);
  if (isFeedAutoplayMuted()) {
    el2.addEventListener("volumechange", onVolumeChangeEnforceFeedMuted);
  }
  connectObserver();
  syncPlayback();
  lastBuiltVideoUrl.value = props.video;
}

function onCanPlay() {
  syncPlayback();
}

function scheduleInit() {
  disconnectDeferredHostObserver();
  disconnectObserver();
  teardownPlayer();
  isVisible.value = false;

  nextTick(() => {
    if (!props.video) return;
    if (!shouldDeferPlayerInit()) {
      buildPlayer();
      return;
    }
    const host = hostRef.value;
    if (!host) return;
    deferredHostObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && props.video) {
          disconnectDeferredHostObserver();
          buildPlayer();
        }
      },
      { threshold: 0.15, rootMargin: "80px 0px" },
    );
    deferredHostObserver.observe(host);
  });
}

watch([() => props.autoplay, () => props.video, () => props.controls], () => {
  scheduleInit();
});

onMounted(() => {
  scheduleInit();
});

watch(
  () => props.showMuteToggle,
  (show) => {
    feedUserWantsUnmuted.value = false;
    if (!show) nextTick(() => enforceFeedMuted());
  },
);

watch(
  () => props.video,
  () => {
    feedUserWantsUnmuted.value = false;
  },
);

onBeforeUnmount(() => {
  disconnectDeferredHostObserver();
  disconnectObserver();
  teardownPlayer();
});
</script>

<template>
  <div
    ref="hostRef"
    class="h-full w-full"
    :class="[
      props.controls ? 'video-render--controls' : 'video-render--cover',
      showMuteToggleUi ? 'relative' : '',
    ]"
  >
    <video
      ref="videoRef"
      class="video-render__media"
      loop
      muted
      playsinline
      :preload="props.controls ? 'auto' : 'metadata'"
    />
    <button
      v-if="showMuteToggleUi"
      type="button"
      class="video-render__mute-toggle"
      :aria-label="muteToggleAriaLabel"
      @click.stop.prevent="toggleFeedMute"
    >
      <Icon
        class="text-2xl text-white drop-shadow-md"
        :icon="
          feedUserWantsUnmuted
            ? 'line-md:volume-high-twotone'
            : 'line-md:volume-high-off-twotone'
        "
      />
    </button>
  </div>
</template>

<style scoped lang="postcss">
.video-render__mute-toggle {
  @apply pointer-events-auto absolute bottom-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400;
}

.video-render--cover :deep(.plyr),
.video-render--cover :deep(.plyr__video-wrapper) {
  @apply h-full w-full;
}

.video-render--cover :deep(.plyr video) {
  @apply h-full w-full object-cover;
}

.video-render--controls :deep(.plyr) {
  /* Plyr accent: big play, hovers, scrubber/volume fill, menu toggles, focus ring */
  --plyr-color-main: #8b5cf6;
  --plyr-focus-visible-color: #a78bfa;
}

.video-render--controls :deep(.plyr),
.video-render--controls :deep(.plyr__video-wrapper) {
  @apply h-full w-full max-h-full;
}

.video-render--controls :deep(.plyr video) {
  @apply mx-auto h-full max-h-full w-full object-contain;
}

/* Plyr hides after fixed JS timeouts; delay the actual hide animation by 5s. */
.video-render--controls
  :deep(.plyr--video.plyr--hide-controls .plyr__controls) {
  transition:
    opacity 0.4s ease-in-out 5s,
    transform 0.4s ease-in-out 5s;
}
</style>
