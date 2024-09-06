<script setup lang="ts">
interface Props {
  size: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
}

const props = defineProps<Props>();

const space = computed(() => {
  switch (props.size) {
    case "xs":
      return "py-4";
    case "sm":
      return "py-6";
    case "md":
      return "py-8";
    case "lg":
      return "py-12";
    case "xl":
      return "py-16";
    case "xxl":
      return "py-24";
    default:
      return "py-4";
  }
});
</script>

<template>
  <div :class="[space]"></div>
</template>
