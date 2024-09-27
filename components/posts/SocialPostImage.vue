<script lang="ts" setup>
interface Props {
  img: string;
}

const props = defineProps<Props>();
const img = useImage();
</script>

<template>
  <div class="h-full w-full">
    <!-- <NuxtImg  :src="props.img" :placeholder="img(props.img, { h: 100, f: 'png', blur: 2, q: 50 })" /> -->
    <img :src="`/assets/${props.img}`" alt="" class="object-cover h-full w-full" />
  </div>
</template>
