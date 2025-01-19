<script lang="ts" setup>
interface Props {
  loading: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(["intersected"]);
const options = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};
const observer = ref<IntersectionObserver | null>(null);

function handleIntersection(entries: IntersectionObserverEntry[]) {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !props.loading) {
      emit("intersected");
    }
  });
}

onMounted(async () => {
  const target = document.querySelector("#bottom-of-page-observable");
  observer.value = new IntersectionObserver(handleIntersection, options);
  if (target) {
    observer.value.observe(target);
  }
});
</script>

<template>
  <div id="bottom-of-page-observable" />
</template>
