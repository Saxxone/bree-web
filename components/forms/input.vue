<script lang="ts" setup>
interface Props {
  icon?: string;
}
const props = defineProps<Props>();
</script>

<template>
  <div>
    <span class="material-symbols-rounded">
      {{ props.icon }}
    </span>
    <input type="text" />
  </div>
</template>

<style></style>
