<script lang="ts" setup>
const emit = defineEmits(["intersected"]);
const target = ref<Element | null>(null);
const options = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};
const observer = ref<IntersectionObserver | null>(null);

function handleIntersection(entries: any) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      emit("intersected");
    }
  });
}

onMounted(async () => {
  target.value = document.querySelector("#bottom-of-page-observable");
  observer.value = new IntersectionObserver(handleIntersection, options);
  if (target.value) {
    observer.value.observe(target.value);
  }
});
</script>

<template>
  <div id="bottom-of-page-observable" />
</template>
