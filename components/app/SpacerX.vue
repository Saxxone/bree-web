<script setup lang="ts">
interface Props {
  size: "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
}

const props = defineProps<Props>();

const space = computed(() => {
  switch (props.size) {
    case "xxs":
      return "py-2";
    case "xs":
      return "px-4";
    case "sm":
      return "px-6";
    case "md":
      return "px-8";
    case "lg":
      return "px-12";
    case "xl":
      return "px-16";
    case "xxl":
      return "px-24";
    default:
      return "px-4";
  }
});
</script>

<template>
  <div :class="[space]"/>
</template>
