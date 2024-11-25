<script setup lang="ts">
interface Props {
  contents: any[];
  currentPage: number;
}

const props = defineProps<Props>();
const emit = defineEmits(["page"]);

const scroller = ref<HTMLElement | null>(null);
const current_page = ref(0);

function goTo(index: number) {
  nextTick(() => {
    if (
      !scroller.value ||
      !(scroller.value instanceof HTMLElement) ||
      index < 0 ||
      index >= props.contents.length
    )
      return;

    const child_width = scroller.value?.offsetWidth || 0;
    const scroll_left = index * child_width;
    scroller.value.scrollTo({
      left: scroll_left,
      behavior: "smooth",
    });
    current_page.value = index;
  });
}

function onScroll() {
  if (!scroller.value) return;

  const childWidth = (scroller.value as HTMLElement).offsetWidth || 0;
  const scrollLeft = scroller.value.scrollLeft;
  current_page.value = Math.round(scrollLeft / childWidth);
  emit("page", current_page.value);
}

onMounted(() => {
  if (scroller.value) {
    scroller.value.addEventListener("scroll", onScroll);
  }
});

onUnmounted(() => {
  if (scroller.value) {
    scroller.value.removeEventListener("scroll", onScroll);
  }
});

watch(
  () => props.currentPage,
  () => {
    goTo(props.currentPage);
  },
);
</script>

<template>
  <div class="flex overflow-x-auto snap-x space-x-4" ref="scroller">
    <div
      v-for="(content, index) in contents"
      :key="index"
      class="snap-start shrink-0 w-full"
    >
      <slot></slot>
    </div>
  </div>
</template>
