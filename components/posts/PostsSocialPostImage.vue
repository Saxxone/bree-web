<script lang="ts" setup>
interface Props {
  img: string;
}

const props = defineProps<Props>();
const img = useImage();
</script>

<template>
  <div>
    <AppSpacerY size="xxs" />
    <NuxtImg
      class="rounded-lg post-img"
      :src="props.img"
      :placeholder="img(props.img, { h: 100, f: 'png', blur: 2, q: 50 })"
    />
  </div>
</template>
