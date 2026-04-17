<script lang="ts" setup>
import { socialMainScrollElKey } from "~/utils/socialMainScrollEl";

interface Props {
  loading: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{ intersected: [] }>();

const scrollRootRef = inject(socialMainScrollElKey, undefined);
const targetRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

function handleIntersection(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    if (entry.isIntersecting && !props.loading) {
      emit("intersected");
    }
  }
}

function disconnect() {
  observer?.disconnect();
  observer = null;
}

function connect() {
  disconnect();
  const target = targetRef.value;
  if (!target) return;
  const root = scrollRootRef?.value ?? null;
  observer = new IntersectionObserver(handleIntersection, {
    root,
    rootMargin: "200px",
    threshold: 0.01,
  });
  observer.observe(target);
}

onMounted(() => {
  nextTick(connect);
});

watch(
  () => scrollRootRef?.value,
  () => {
    nextTick(connect);
  },
);

watch(
  () => props.loading,
  (loading) => {
    if (!loading) {
      nextTick(connect);
    }
  },
);

onBeforeUnmount(() => {
  disconnect();
});
</script>

<template>
  <div ref="targetRef" class="h-px w-full shrink-0" aria-hidden="true" />
</template>
