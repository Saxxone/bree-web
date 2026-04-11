<script lang="ts" setup>
interface Props {
  video: string;
  controls?: boolean;
  autoplay?: boolean;
}

const props = defineProps<Props>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isVisible = ref(false);
let observer: IntersectionObserver | null = null;

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

function rebind() {
  nextTick(() => {
    connectObserver();
    syncPlayback();
  });
}

watch([() => props.autoplay, () => props.video], rebind);

onMounted(() => rebind());

onBeforeUnmount(() => {
  disconnectObserver();
});

function onCanPlay() {
  syncPlayback();
}
</script>

<template>
  <div class="h-full w-full">
    <video
      ref="videoRef"
      class=""
      :class="{
        'h-full !w-full object-cover': !props.controls,
        'mx-auto': props.controls,
      }"
      :src="props.video"
      :controls="props.controls"
      loop
      muted
      playsinline
      preload="auto"
      @canplay="onCanPlay"
    />
  </div>
</template>
