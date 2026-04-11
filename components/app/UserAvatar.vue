<script lang="ts" setup>
import { Icon } from "@iconify/vue";

/** Same default as chat room avatars when no user image. */
const DEFAULT_FALLBACK = "https://pbs.bree.social/bree-pfp.svg";

interface Props {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  imgClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  alt: "",
  width: 40,
  height: 40,
  imgClass: "avatar",
});

const img = useImage();

type Phase = "primary" | "fallback" | "icon";
const phase = ref<Phase>("primary");

watch(
  () => props.src,
  () => {
    phase.value = props.src?.trim() ? "primary" : "fallback";
  },
  { immediate: true },
);

const displaySrc = computed(() => {
  if (phase.value === "icon") return "";
  if (phase.value === "fallback") return DEFAULT_FALLBACK;
  return props.src!.trim();
});

const placeholder = computed(() => {
  if (phase.value !== "primary" || !props.src?.trim()) return undefined;
  return img(props.src.trim(), {
    h: props.height,
    w: props.width,
    f: "png",
    blur: 2,
    q: 50,
  });
});

function onError() {
  if (phase.value === "primary") {
    phase.value = "fallback";
  } else {
    phase.value = "icon";
  }
}

const iconClass = computed(() => {
  const w = props.width;
  if (w >= 80) return "text-5xl";
  if (w >= 56) return "text-4xl";
  if (w >= 48) return "text-3xl";
  return "text-2xl";
});
</script>

<template>
  <NuxtImg
    v-if="phase !== 'icon'"
    :key="displaySrc"
    :width="width"
    :height="height"
    :class="imgClass"
    :src="displaySrc"
    :alt="alt"
    :placeholder="placeholder"
    @error="onError"
  />
  <div
    v-else
    :class="[imgClass, 'flex shrink-0 items-center justify-center text-muted']"
    role="img"
    :aria-label="alt || 'User avatar'"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      boxSizing: 'border-box',
    }"
  >
    <Icon icon="line-md:person-twotone" :class="iconClass" />
  </div>
</template>
