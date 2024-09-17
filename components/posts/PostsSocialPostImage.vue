<script lang="ts" setup>
interface Props {
  img: string;
}
const props = defineProps<Props>();
</script>

<template>
  <div>
    <AppSpacerY size="xxs" />
    <NuxtImg :src="props.img" class="post-img" />
  </div>
</template>
