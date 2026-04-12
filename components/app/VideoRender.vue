<script lang="ts" setup>
import Hls from "hls.js";
import PlyrCtor from "plyr";
import "plyr/dist/plyr.css";

type PlyrInstance = InstanceType<typeof PlyrCtor>;

interface Props {
  video: string;
  controls?: boolean;
  autoplay?: boolean;
}

const props = defineProps<Props>();

const hostRef = ref<HTMLDivElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
const isVisible = ref(false);

let observer: IntersectionObserver | null = null;
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

function onPlayUnmuteForFullPlayer() {
  if (!props.controls) return;
  const el = videoRef.value;
  if (!el || !plyrInstance) return;
  el.muted = false;
  (plyrInstance as unknown as { muted: boolean }).muted = false;
}

function teardownPlayer() {
  const el = videoRef.value;
  if (el) {
    el.removeEventListener("canplay", onCanPlay);
    el.removeEventListener("play", onPlayUnmuteForFullPlayer);
  }
  destroyHls();
  destroyPlyr();
  if (el) {
    el.removeAttribute("src");
    el.load();
  }
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
    void el.play().catch(() => {});
  } else {
    el.pause();
  }
}

function disconnectObserver() {
  observer?.disconnect();
  observer = null;
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
  teardownPlayer();
  const el = videoRef.value;
  if (!el || !props.video) return;

  clearPlyrProperty(el);

  el.muted = true;
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");

  if (isHlsUrl(props.video)) {
    attachHls(el, props.video);
  } else {
    el.src = props.video;
  }

  plyrInstance = new PlyrCtor(el, {
    ...(props.controls ? {} : { controls: [] }),
    muted: true,
    loop: { active: true },
    autoplay: false,
    clickToPlay: props.controls,
    hideControls: !!props.controls,
    resetOnEnd: false,
  });

  el.addEventListener("canplay", onCanPlay);
  el.addEventListener("play", onPlayUnmuteForFullPlayer);
  connectObserver();
  syncPlayback();
}

function onCanPlay() {
  syncPlayback();
}

function rebind() {
  nextTick(() => {
    buildPlayer();
  });
}

watch([() => props.autoplay, () => props.video, () => props.controls], () => {
  rebind();
});

onMounted(() => rebind());

onBeforeUnmount(() => {
  disconnectObserver();
  teardownPlayer();
});
</script>

<template>
  <div
    ref="hostRef"
    class="h-full w-full"
    :class="props.controls ? 'video-render--controls' : 'video-render--cover'"
  >
    <video
      ref="videoRef"
      class="video-render__media"
      loop
      muted
      playsinline
      preload="auto"
    />
  </div>
</template>

<style scoped lang="postcss">
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
